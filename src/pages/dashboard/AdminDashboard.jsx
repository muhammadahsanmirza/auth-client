import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Title, Text, Paper, SimpleGrid, Group, ThemeIcon, Table, Select, Button, Modal } from '@mantine/core';
import { FiUsers, FiSettings, FiShield, FiActivity, FiPieChart } from 'react-icons/fi';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../components/ui/Toast';
import Loader, { LoaderVariant } from '../../components/ui/Loader';

const AdminDashboard = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const [activeFeature, setActiveFeature] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [error, setError] = useState(null);

  const features = [
    { title: 'User Management', icon: <FiUsers size={20} />, color: 'blue' },
    { title: 'Role Management', icon: <FiShield size={20} />, color: 'green' },
    { title: 'System Configuration', icon: <FiSettings size={20} />, color: 'orange' },
    { title: 'Audit Logs', icon: <FiActivity size={20} />, color: 'red' },
    { title: 'Analytics', icon: <FiPieChart size={20} />, color: 'violet' }
  ];

  useEffect(() => {
    if (activeFeature === 'User Management') {
      fetchUsers();
    }
  }, [activeFeature]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAllUsers();
      if (response.data && response.data.data && response.data.data.users) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load users. Please try again.';
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    setLoading(true);
    try {
      const response = await api.updateUserRole({
        userId: selectedUser._id,
        role: newRole
      });
      
      if (response.data && response.data.success) {
        showSuccessToast('User role updated successfully');
        // Update the user in the local state
        setUsers(users.map(u => 
          u._id === selectedUser._id ? { ...u, role: newRole } : u
        ));
        setRoleModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showErrorToast('Failed to update user role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const renderContent = () => {
    if (!activeFeature) {
      return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {features.map((feature, index) => (
            <Paper
              key={index}
              p="md"
              radius="md"
              withBorder
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveFeature(feature.title)}
              styles={(theme) => ({
                root: {
                  backgroundColor: darkMode ? theme.colors.dark[6] : theme.white,
                  borderColor: darkMode ? theme.colors.dark[4] : theme.colors.gray[3],
                }
              })}
            >
              <Group>
                <ThemeIcon color={feature.color} variant="light" size="lg" radius="md">
                  {feature.icon}
                </ThemeIcon>
                <Text weight={500}>{feature.title}</Text>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      );
    }

    if (activeFeature === 'User Management') {
      return (
        <div>
          <Group position="apart" mb="md">
            <Title order={3}>{activeFeature}</Title>
            <Button onClick={() => setActiveFeature(null)}>Back</Button>
          </Group>
          
          {loading ? (
            <Loader variant={LoaderVariant.INLINE} text="Loading users..." />
          ) : error ? (
            <Paper
              p="md"
              radius="md"
              withBorder
              styles={(theme) => ({
                root: {
                  backgroundColor: darkMode ? theme.colors.dark[6] : theme.white,
                  borderColor: darkMode ? theme.colors.dark[4] : theme.colors.gray[3],
                }
              })}
            >
              <Text color="red">{error}</Text>
              <Button mt="md" onClick={fetchUsers}>Retry</Button>
            </Paper>
          ) : (
            <Paper
              p="md"
              radius="md"
              withBorder
              styles={(theme) => ({
                root: {
                  backgroundColor: darkMode ? theme.colors.dark[6] : theme.white,
                  borderColor: darkMode ? theme.colors.dark[4] : theme.colors.gray[3],
                }
              })}
            >
              <Table striped>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.Name}</td>
                        <td>{user.email}</td>
                        <td>
                          <ThemeIcon 
                            color={user.role === 'admin' ? 'red' : user.role === 'manager' ? 'orange' : 'blue'} 
                            variant="light" 
                            size="sm" 
                            radius="xl"
                            mr={5}
                          />
                          {user.role}
                        </td>
                        <td>
                          <Button 
                            size="xs" 
                            variant="outline"
                            onClick={() => openRoleModal(user)}
                          >
                            Change Role
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center' }}>No users found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Paper>
          )}
        </div>
      );
    }

    return (
      <div>
        <Group position="apart" mb="md">
          <Title order={3}>{activeFeature}</Title>
          <Button onClick={() => setActiveFeature(null)}>Back</Button>
        </Group>
        <Paper
          p="md"
          radius="md"
          withBorder
          styles={(theme) => ({
            root: {
              backgroundColor: darkMode ? theme.colors.dark[6] : theme.white,
              borderColor: darkMode ? theme.colors.dark[4] : theme.colors.gray[3],
            }
          })}
        >
          <Text>This feature is coming soon.</Text>
        </Paper>
      </div>
    );
  };

  return (
    <div className="p-6">
      <Title 
        order={2} 
        className="mb-6"
        styles={(theme) => ({
          root: {
            color: darkMode ? theme.colors.gray[0] : theme.colors.gray[9],
          }
        })}
      >
        Admin Dashboard
      </Title>
      
      <Text 
        className="mb-6"
        styles={(theme) => ({
          root: {
            color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7],
          }
        })}
      >
        Welcome back, {user?.Name || 'Admin'}! You have full access to the system.
      </Text>
      
      {renderContent()}

      <Modal
        opened={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Update User Role"
        centered
      >
        {selectedUser && (
          <div>
            <Text mb="md">
              Change role for user: <strong>{selectedUser.Name}</strong>
            </Text>
            
            <Select
              label="Select new role"
              value={newRole}
              onChange={setNewRole}
              data={[
                { value: 'user', label: 'User' },
                { value: 'manager', label: 'Manager' },
                { value: 'admin', label: 'Admin' }
              ]}
              mb="md"
            />
            
            <Group position="right">
              <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole} loading={loading}>
                Update Role
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;