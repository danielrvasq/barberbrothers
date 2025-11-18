import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserCard from "../components/admin/UserCard";
import UserModal from "../components/admin/UserModal";
import Toast from "../components/common/Toast";
import {
  getUsers,
  updateUser,
  updateUserRole,
  deleteUser,
  searchUsers,
  getUsersByRole,
} from "../lib/usersService";
import "./UsersPage.css";

const UsersPage = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    barbers: 0,
    clients: 0,
  });

  useEffect(() => {
    if (!authLoading && isAdmin()) {
      loadUsers();
    }
  }, [authLoading]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error loading users:", error);
      showToast("Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    setStats({
      total: usersData.length,
      admins: usersData.filter((u) => u.role === "admin").length,
      barbers: usersData.filter((u) => u.role === "barber").length,
      clients: usersData.filter((u) => u.role === "client" || !u.role).length,
    });
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(term) ||
          user.full_name?.toLowerCase().includes(term)
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => {
        if (roleFilter === "client") {
          return user.role === "client" || !user.role;
        }
        return user.role === roleFilter;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (formData) => {
    try {
      await updateUser(selectedUser.id, formData);
      showToast("Usuario actualizado correctamente", "success");
      setIsModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      showToast("Error al actualizar usuario", "error");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      showToast("Rol actualizado correctamente", "success");
      loadUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      showToast("Error al actualizar el rol", "error");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }

    try {
      await deleteUser(userId);
      showToast("Usuario eliminado correctamente", "success");
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("Error al eliminar usuario", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "info" });
    }, 3000);
  };

  if (authLoading || loading) {
    return (
      <div className="users-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="users-page">
        <div className="error-container">
          <h2>⛔ Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>👥 Administración de Usuarios</h1>
        <p className="page-subtitle">Gestiona todos los usuarios del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Usuarios</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-info">
            <div className="stat-value">{stats.admins}</div>
            <div className="stat-label">Administradores</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✂️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.barbers}</div>
            <div className="stat-label">Barberos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <div className="stat-value">{stats.clients}</div>
            <div className="stat-label">Clientes</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o email..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="filter-select"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="barber">Barberos</option>
            <option value="client">Clientes</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="users-grid">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onChangeRole={handleChangeRole}
            />
          ))
        )}
      </div>

      {/* Modal */}
      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} show={toast.show} />
    </div>
  );
};

export default UsersPage;
