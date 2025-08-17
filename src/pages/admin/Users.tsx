import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { Users, Search, PlusCircle, Mail, UserCheck, CalendarIcon, Shield } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '@/lib/apiConfig';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'pending_verification';
  created_at: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const params = new URLSearchParams({
        role: roleFilter,
        status: statusFilter,
        search: debouncedSearchTerm,
        page: String(currentPage),
        limit: String(usersPerPage),
      });

      const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to fetch users.');

      setUsers(result.data);
      setTotalUsers(result.count);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, currentUser, roleFilter, statusFilter, debouncedSearchTerm, currentPage, usersPerPage]);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.app_metadata?.role !== 'admin') {
        navigate('/admin/login');
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'pending_verification':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleOpenDetails = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            View, search, and manage all users on the platform.
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="society">Society</option>
                <option value="partner">Partner</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending_verification">Pending Verification</option>
              </select>
              <Button disabled>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-4 sm:p-12">
                <LoadingSpinner variant="page" size="md" text="Loading users..." />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Users Found</h3>
                <p className="text-gray-600">No users match your current filters.</p>
              </div>
            ) : (
              <div>
                {/* Header for larger screens */}
                <div className="hidden md:grid md:grid-cols-6 gap-4 px-6 py-3 border-b bg-gray-50 font-medium text-sm text-gray-600">
                  <div className="col-span-2">User</div>
                  <div className="hidden md:block">Role</div>
                  <div className="hidden md:block">Status</div>
                  <div className="hidden md:block">Joined</div>
                  <div>Actions</div>
                </div>
                {/* User items */}
                <ul className="divide-y divide-gray-200">
                  {users.map(user => (
                    <li key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                        <div className="col-span-2 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                               {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                           </div>
                           <div>
                                <p className="font-medium text-gray-900">{user.name || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                           </div>
                        </div>
                        <div className="hidden md:block">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                            {user.role}
                          </Badge>
                        </div>
                        <div className="hidden md:block">
                            {getStatusBadge(user.status)}
                        </div>
                        <div className="hidden md:block text-sm text-gray-500">
                           {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex justify-end md:justify-start gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenDetails(user)}>Details</Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="mt-6">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                        </PaginationItem>
                        <PaginationItem><span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span></PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={(isOpen) => !isOpen && setSelectedUser(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedUser.name || 'User Details'}</DialogTitle>
                <DialogDescription>
                  Detailed information for {selectedUser.email}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">{selectedUser.email}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm capitalize">{selectedUser.role}</span>
                </div>
                <div className="flex items-center">
                  <UserCheck className="w-4 h-4 mr-3 text-gray-500" />
                  {getStatusBadge(selectedUser.status)}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">
                    Joined on {new Date(selectedUser.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>

      <Footer />
    </div>
  );
}
