/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Container,
    Button,
    Modal,
    Form,
    Spinner,
    Alert,
    Row,
    Col,
    Badge,
    InputGroup,
    Card,
    ProgressBar,
} from "react-bootstrap";
import {
    Medal,
    Award,
    Trophy,
    Crown,
    Users,
    Plus,
    Search,
    User,
    Mail,
    Phone,
    Eye,
    Edit2,
    Trash2,
    Calendar,
    History,
    Sparkles,
    Filter
} from "lucide-react";

type Customer = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    loyaltyPoints: number;
    tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
    createdAt: string;
    _count?: { transactions: number };
    transactions?: Transaction[];
};

type Transaction = {
    id: number;
    createdAt: string;
    totalCents: number;
    items: {
        id: number;
        quantity: number;
        subtotalCents: number;
        product: { name: string };
    }[];
};

const initialFormState = {
    name: "",
    email: "",
    phone: "",
    loyaltyPoints: "0",
};

const tierConfig = {
    BRONZE: {
        gradient: "linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)",
        bg: "#cd7f32",
        text: "#fff",
        Icon: Medal,
        glow: "rgba(205, 127, 50, 0.3)",
    },
    SILVER: {
        gradient: "linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)",
        bg: "#c0c0c0",
        text: "#333",
        Icon: Award,
        glow: "rgba(192, 192, 192, 0.4)",
    },
    GOLD: {
        gradient: "linear-gradient(135deg, #ffd700 0%, #ffb800 100%)",
        bg: "#ffd700",
        text: "#333",
        Icon: Trophy,
        glow: "rgba(255, 215, 0, 0.4)",
    },
    PLATINUM: {
        gradient: "linear-gradient(135deg, #e5e4e2 0%, #b8b8b8 100%)",
        bg: "#e5e4e2",
        text: "#333",
        Icon: Crown,
        glow: "rgba(229, 228, 226, 0.5)",
    },
};

const tierThresholds = {
    BRONZE: { min: 0, max: 999, next: "SILVER", nextPoints: 1000 },
    SILVER: { min: 1000, max: 4999, next: "GOLD", nextPoints: 5000 },
    GOLD: { min: 5000, max: 9999, next: "PLATINUM", nextPoints: 10000 },
    PLATINUM: { min: 10000, max: Infinity, next: null, nextPoints: null },
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [filterTier, setFilterTier] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        setLoading(true);
        try {
            const res = await fetch("/api/customers");
            const data = await res.json();
            setCustomers(data);
        } catch (err) {
            console.error("Failed to fetch customers", err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCustomerProfile(id: number) {
        setLoadingProfile(true);
        try {
            const res = await fetch(`/api/customers?id=${id}`);
            const data = await res.json();
            setSelectedCustomer(data);
        } catch (err) {
            console.error("Failed to fetch customer profile", err);
        } finally {
            setLoadingProfile(false);
        }
    }

    const filteredCustomers = useMemo(() => {
        let result = [...customers];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(lowerTerm) ||
                    c.email?.toLowerCase().includes(lowerTerm) ||
                    c.phone?.includes(lowerTerm)
            );
        }

        if (filterTier) {
            result = result.filter((c) => c.tier === filterTier);
        }

        return result;
    }, [customers, searchTerm, filterTier]);

    const openModal = (customer?: Customer) => {
        setErrorMsg("");
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name,
                email: customer.email || "",
                phone: customer.phone || "",
                loyaltyPoints: customer.loyaltyPoints.toString(),
            });
        } else {
            setEditingCustomer(null);
            setFormData(initialFormState);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData(initialFormState);
        setEditingCustomer(null);
    };

    const openProfile = async (customer: Customer) => {
        setShowProfileModal(true);
        await fetchCustomerProfile(customer.id);
    };

    const handleInput = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    async function handleSave() {
        setErrorMsg("");
        const isEditMode = !!editingCustomer;
        const method = isEditMode ? "PUT" : "POST";
        const payload = isEditMode ? { ...formData, id: editingCustomer.id } : formData;

        try {
            const res = await fetch("/api/customers", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setErrorMsg(errorData.error);
                return;
            }
            closeModal();
            fetchCustomers();
        } catch {
            setErrorMsg("System error occurred.");
        }
    }

    async function handleDelete(customer: Customer) {
        if (!confirm(`Delete customer "${customer.name}"?`)) return;
        await fetch(`/api/customers?id=${customer.id}`, { method: "DELETE" });
        fetchCustomers();
    }

    const toRupiah = (cents: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(cents / 100);
    };

    const getLoyaltyProgress = (points: number, tier: string) => {
        const thresholds = tierThresholds[tier as keyof typeof tierThresholds];
        if (!thresholds.nextPoints) {
            return { progress: 100, remaining: 0, nextTier: null };
        }
        const progress = ((points - thresholds.min) / (thresholds.nextPoints - thresholds.min)) * 100;
        return {
            progress: Math.min(progress, 100),
            remaining: thresholds.nextPoints - points,
            nextTier: thresholds.next,
        };
    };

    // Styles
    const styles = {
        page: {
            minHeight: "100vh",
            paddingTop: "2rem",
            paddingBottom: "3rem",
            position: "relative" as const,
        },
        header: {
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "1rem",
            padding: "2rem",
            marginBottom: "2rem",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        statCard: {
            borderRadius: "1rem",
            border: "none",
            transition: "all 0.3s ease",
            cursor: "pointer",
            overflow: "hidden",
        },
        customerCard: {
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "1rem",
            padding: "1.25rem",
            marginBottom: "1rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "all 0.3s ease",
            color: "white",
        },
        searchBox: {
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "1rem",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        avatar: (tier: string) => ({
            width: 56,
            height: 56,
            background: tierConfig[tier as keyof typeof tierConfig]?.gradient || tierConfig.BRONZE.gradient,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: tierConfig[tier as keyof typeof tierConfig]?.text || "#fff",
            fontWeight: 700,
            fontSize: "1.25rem",
            boxShadow: `0 4px 15px ${tierConfig[tier as keyof typeof tierConfig]?.glow || "rgba(0,0,0,0.1)"}`,
        }),
        tierBadge: (tier: string) => ({
            background: tierConfig[tier as keyof typeof tierConfig]?.gradient || tierConfig.BRONZE.gradient,
            color: tierConfig[tier as keyof typeof tierConfig]?.text || "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "2rem",
            fontWeight: 600,
            fontSize: "0.8rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: `0 2px 8px ${tierConfig[tier as keyof typeof tierConfig]?.glow || "rgba(0,0,0,0.1)"}`,
        }),
        actionButton: {
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
        },
    };

    return (
        <div style={styles.page}>
            <div className="premium-bg" />
            <Container>
                {/* Premium Header */}
                <div style={styles.header}>
                    <Row className="align-items-center">
                        <Col>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        background: "rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h2 className="mb-0 fw-bold">Customer Management</h2>
                                    <p className="mb-0 opacity-75" style={{ fontSize: "0.95rem" }}>
                                        Build relationships, track loyalty, grow your business
                                    </p>
                                </div>
                            </div>
                        </Col>
                        <Col xs="auto">
                            <Button
                                onClick={() => openModal()}
                                style={{
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    border: "none",
                                    padding: "0.75rem 1.5rem",
                                    borderRadius: "0.75rem",
                                    fontWeight: 600,
                                    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <Plus size={18} /> Add Customer
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* Tier Stats - Horizontal Cards */}
                <Row className="g-3 mb-4">
                    {(["BRONZE", "SILVER", "GOLD", "PLATINUM"] as const).map((tier) => {
                        const count = customers.filter((c) => c.tier === tier).length;
                        const config = tierConfig[tier];
                        const Icon = config.Icon;
                        return (
                            <Col key={tier} md={3}>
                                <Card
                                    style={{
                                        ...styles.statCard,
                                        background: "rgba(255, 255, 255, 0.05)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        color: "white"
                                    }}
                                    className="h-100 hover-lift"
                                    onClick={() => setFilterTier(filterTier === tier ? "" : tier)}
                                >
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    background: config.gradient,
                                                    borderRadius: "12px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: config.text === "#fff" ? "white" : "#333",
                                                    boxShadow: `0 4px 12px ${config.glow}`,
                                                }}
                                            >
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <p className="mb-0 text-white-50" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                    {tier}
                                                </p>
                                                <h3 className="mb-0 fw-bold">{count}</h3>
                                            </div>
                                        </div>
                                        {filterTier === tier && (
                                            <Badge bg="primary" className="mt-2" style={{ fontSize: "0.7rem" }}>
                                                Filtered
                                            </Badge>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* Search & Filter Bar */}
                <div style={styles.searchBox}>
                    <Row className="g-3 align-items-center">
                        <Col md={5}>
                            <InputGroup>
                                <InputGroup.Text
                                    style={{
                                        background: "rgba(0, 0, 0, 0.2)",
                                        border: "none",
                                        borderRadius: "0.75rem 0 0 0.75rem",
                                        padding: "0.75rem 1rem",
                                        color: "#94a3b8",
                                    }}
                                >
                                    <Search size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search customers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        border: "none",
                                        background: "rgba(0, 0, 0, 0.2)",
                                        borderRadius: "0 0.75rem 0.75rem 0",
                                        padding: "0.75rem 1rem",
                                        color: "white",
                                    }}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <InputGroup>
                                <InputGroup.Text
                                    style={{
                                        background: "rgba(0, 0, 0, 0.2)",
                                        border: "none",
                                        borderRadius: "0.75rem 0 0 0.75rem",
                                        padding: "0.75rem 1rem",
                                        color: "#94a3b8",
                                    }}
                                >
                                    <Filter size={18} />
                                </InputGroup.Text>
                                <Form.Select
                                    value={filterTier}
                                    onChange={(e) => setFilterTier(e.target.value)}
                                    style={{
                                        border: "none",
                                        background: "rgba(0, 0, 0, 0.2)",
                                        borderRadius: "0 0.75rem 0.75rem 0",
                                        padding: "0.75rem 1rem",
                                        color: "white",
                                    }}
                                >
                                    <option value="">All Tiers</option>
                                    <option value="BRONZE">Bronze</option>
                                    <option value="SILVER">Silver</option>
                                    <option value="GOLD">Gold</option>
                                    <option value="PLATINUM">Platinum</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col md={4} className="text-end">
                            <span className="text-white-50" style={{ fontSize: "0.9rem" }}>
                                Showing <strong className="text-white">{filteredCustomers.length}</strong> of <strong className="text-white">{customers.length}</strong> customers
                            </span>
                        </Col>
                    </Row>
                </div>

                {/* Customer Cards Grid */}
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Loading customers...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <Card style={{
                        borderRadius: "1rem",
                        border: "1px solid rgba(255,255,255,0.1)",
                        textAlign: "center",
                        padding: "3rem",
                        background: "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(10px)",
                        color: "white"
                    }}>
                        <div className="mx-auto mb-3 text-white-50">
                            <User size={64} />
                        </div>
                        <h5 className="text-white">
                            {searchTerm || filterTier ? "No customers match your search" : "No customers yet"}
                        </h5>
                        <p className="text-white-50 mb-4">
                            {searchTerm || filterTier ? "Try adjusting your filters" : "Add your first customer to get started!"}
                        </p>
                        {!searchTerm && !filterTier && (
                            <Button variant="primary" onClick={() => openModal()}>
                                <Plus size={18} className="me-2" /> Add First Customer
                            </Button>
                        )}
                    </Card>
                ) : (
                    <Row className="g-3">
                        {filteredCustomers.map((customer) => {
                            const tierCfg = tierConfig[customer.tier];
                            const TierIcon = tierCfg.Icon;
                            const progress = getLoyaltyProgress(customer.loyaltyPoints, customer.tier);
                            return (
                                <Col key={customer.id} lg={6} xl={4}>
                                    <div
                                        style={{
                                            ...styles.customerCard,
                                            borderLeft: `4px solid ${tierCfg.bg}`,
                                        }}
                                        className="hover-lift"
                                    >
                                        {/* Top Row: Avatar + Info */}
                                        <div className="d-flex gap-3 mb-3">
                                            <div style={styles.avatar(customer.tier)}>
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1 fw-bold">{customer.name}</h6>
                                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                                    <span style={styles.tierBadge(customer.tier)}>
                                                        <TierIcon size={14} /> {customer.tier}
                                                    </span>
                                                    <Badge
                                                        bg="dark"
                                                        text="light"
                                                        style={{ fontWeight: 500, padding: "0.4rem 0.6rem", border: "1px solid rgba(255,255,255,0.1)" }}
                                                    >
                                                        {customer._count?.transactions || 0} orders
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="mb-3" style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                                            {customer.email && (
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <Mail size={14} /> {customer.email}
                                                </div>
                                            )}
                                            {customer.phone && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <Phone size={14} /> {customer.phone}
                                                </div>
                                            )}
                                            {!customer.email && !customer.phone && (
                                                <span className="text-white-50 fst-italic">No contact info</span>
                                            )}
                                        </div>

                                        {/* Loyalty Progress */}
                                        <div className="mb-3 p-3" style={{ background: "rgba(0,0,0,0.2)", borderRadius: "0.75rem" }}>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Loyalty Points</span>
                                                <span className="fw-bold" style={{ color: "#818cf8" }}>
                                                    {customer.loyaltyPoints.toLocaleString()} pts
                                                </span>
                                            </div>
                                            <ProgressBar
                                                now={progress.progress}
                                                style={{ height: 6, borderRadius: 10, background: "rgba(255,255,255,0.1)" }}
                                                variant="success"
                                            />
                                            {progress.nextTier && (
                                                <div className="text-end mt-1" style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                                    {progress.remaining.toLocaleString()} pts to {progress.nextTier}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="flex-grow-1"
                                                style={{ ...styles.actionButton, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                                                onClick={() => openProfile(customer)}
                                            >
                                                <Eye size={16} /> View Profile
                                            </Button>
                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                style={{ ...styles.actionButton, padding: "0.5rem 0.75rem", borderColor: "rgba(255,255,255,0.2)", color: "#e2e8f0" }}
                                                onClick={() => openModal(customer)}
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                style={{ ...styles.actionButton, padding: "0.5rem 0.75rem" }}
                                                onClick={() => handleDelete(customer)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Container>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header
                    closeButton
                    style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: "white",
                        border: "none",
                    }}
                >
                    <Modal.Title className="d-flex align-items-center gap-2">
                        {editingCustomer ? <Edit2 size={24} /> : <Sparkles size={24} />}
                        {editingCustomer ? "Edit Customer" : "Add New Customer"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: "1.5rem" }}>
                    {errorMsg && <Alert variant="danger" className="py-2">{errorMsg}</Alert>}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Name *</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleInput}
                                required
                                style={{ borderRadius: "0.5rem", padding: "0.75rem" }}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleInput}
                                        style={{ borderRadius: "0.5rem", padding: "0.75rem" }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Phone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        placeholder="+62812345678"
                                        value={formData.phone}
                                        onChange={handleInput}
                                        style={{ borderRadius: "0.5rem", padding: "0.75rem" }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {editingCustomer && (
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Loyalty Points</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="loyaltyPoints"
                                    value={formData.loyaltyPoints}
                                    onChange={handleInput}
                                    min="0"
                                    style={{ borderRadius: "0.5rem", padding: "0.75rem" }}
                                />
                                <Form.Text className="text-muted">
                                    Tier auto-updates: Bronze (0-999), Silver (1K-4.9K), Gold (5K-9.9K), Platinum (10K+)
                                </Form.Text>
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ border: "none", padding: "1rem 1.5rem" }}>
                    <Button variant="light" onClick={closeModal} style={{ borderRadius: "0.5rem" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontWeight: 600,
                        }}
                    >
                        {editingCustomer ? "Save Changes" : "Add Customer"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Profile Modal */}
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg" centered>
                <Modal.Header
                    closeButton
                    style={{
                        background: selectedCustomer
                            ? tierConfig[selectedCustomer.tier]?.gradient
                            : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: selectedCustomer ? tierConfig[selectedCustomer.tier]?.text : "white",
                        border: "none",
                    }}
                >
                    <Modal.Title className="d-flex align-items-center gap-2">
                        {selectedCustomer && (
                            <>
                                {(() => {
                                    const TierIcon = tierConfig[selectedCustomer.tier]?.Icon;
                                    return TierIcon ? <TierIcon size={28} /> : null;
                                })()}
                                <strong>{selectedCustomer.name}</strong>
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: "2rem" }}>
                    {loadingProfile ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : selectedCustomer ? (
                        <>
                            {/* Profile Card */}
                            <Row className="mb-4">
                                <Col md={6}>
                                    <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: "1rem" }}>
                                        <h6 className="text-muted mb-3" style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>
                                            Contact Information
                                        </h6>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <Mail size={16} />
                                            <span>{selectedCustomer.email || "No email provided"}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <Phone size={16} />
                                            <span>{selectedCustomer.phone || "No phone provided"}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Calendar size={16} />
                                            <span className="text-muted">
                                                Member since {new Date(selectedCustomer.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div
                                        style={{
                                            padding: "1.5rem",
                                            background: tierConfig[selectedCustomer.tier]?.gradient,
                                            borderRadius: "1rem",
                                            color: tierConfig[selectedCustomer.tier]?.text,
                                            textAlign: "center",
                                        }}
                                    >
                                        <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center" }}>
                                            {(() => {
                                                const TierIcon = tierConfig[selectedCustomer.tier]?.Icon;
                                                return TierIcon ? <TierIcon size={48} /> : null;
                                            })()}
                                        </div>
                                        <h5 className="mb-1">{selectedCustomer.tier} Member</h5>
                                        <h2 className="mb-2 fw-bold">{selectedCustomer.loyaltyPoints.toLocaleString()}</h2>
                                        <p className="mb-0" style={{ opacity: 0.8, fontSize: "0.9rem" }}>Loyalty Points</p>
                                        {(() => {
                                            const progress = getLoyaltyProgress(selectedCustomer.loyaltyPoints, selectedCustomer.tier);
                                            return progress.nextTier ? (
                                                <div className="mt-3">
                                                    <ProgressBar
                                                        now={progress.progress}
                                                        style={{ height: 8, borderRadius: 10, background: "rgba(255,255,255,0.3)" }}
                                                        variant="light"
                                                    />
                                                    <small style={{ opacity: 0.8 }}>
                                                        {progress.remaining.toLocaleString()} pts to {progress.nextTier}
                                                    </small>
                                                </div>
                                            ) : (
                                                <Badge bg="dark" className="mt-2">🎉 Max Tier!</Badge>
                                            );
                                        })()}
                                    </div>
                                </Col>
                            </Row>

                            {/* Purchase History */}
                            <h6 className="mb-3 d-flex align-items-center gap-2" style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px", color: "#64748b" }}>
                                <History size={16} /> Recent Purchase History
                            </h6>
                            {selectedCustomer.transactions && selectedCustomer.transactions.length > 0 ? (
                                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                                    {selectedCustomer.transactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            style={{
                                                padding: "1rem",
                                                background: "#f8fafc",
                                                borderRadius: "0.75rem",
                                                marginBottom: "0.75rem",
                                            }}
                                        >
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                                                    {new Date(tx.createdAt).toLocaleDateString("id-ID", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                                                </span>
                                                <strong style={{ color: "#16a34a" }}>{toRupiah(tx.totalCents)}</strong>
                                            </div>
                                            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                                                {tx.items.map((item, i) => (
                                                    <span key={item.id}>
                                                        {item.product.name} ×{item.quantity}
                                                        {i < tx.items.length - 1 && ", "}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🛒</div>
                                    <p className="mb-0">No purchases yet</p>
                                </div>
                            )}
                        </>
                    ) : null}
                </Modal.Body>
                <Modal.Footer style={{ border: "none" }}>
                    <Button variant="secondary" onClick={() => setShowProfileModal(false)} style={{ borderRadius: "0.5rem" }}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Hover animation styles */}
            <style jsx global>{`
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
        </div>
    );
}
