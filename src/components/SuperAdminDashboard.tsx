import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Building2, Users, Package, Plus, Edit, Trash2 } from 'lucide-react';
import { AdminReports } from './AdminReports';
import { LogoProcessor } from '@/utils/logoProcessor';
import { useBranding } from '@/contexts/BrandingContext';

type Condominio = Tables<'condominios'>;
type Funcionario = Tables<'funcionarios'>;
type Entrega = Tables<'entregas'>;

interface SuperAdminDashboardProps {
  onBack: () => void;
}

export const SuperAdminDashboard = ({ onBack }: SuperAdminDashboardProps) => {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'overview' | 'condominios' | 'funcionarios' | 'entregas' | 'relatorios' | 'branding'>('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCondominio, setEditingCondominio] = useState<Condominio | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    endereco: '',
    cep: '',
    cidade: '',
    telefone: '',
    sindico_nome: '',
    sindico_cpf: '',
    sindico_senha: '',
    sindico_telefone: ''
  });

  // Estado para branding
  const [brandingData, setBrandingData] = useState({
    appName: 'Entregas Zap',
    appDescription: 'Sistema de Gest\u00e3o de Entregas',
    logoUrl: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { updateBranding, refreshBranding } = useBranding();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [condominiosRes, funcionariosRes, entregasRes] = await Promise.all([
        supabase.from('condominios').select('*').order('nome'),
        supabase.from('funcionarios').select('*').order('nome'),
        supabase.from('entregas').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      if (condominiosRes.data) setCondominios(condominiosRes.data);
      if (funcionariosRes.data) setFuncionarios(funcionariosRes.data);
      if (entregasRes.data) setEntregas(entregasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do sistema',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCondominio = async () => {
    try {
      // Validação de campos obrigatórios
      if (!formData.nome.trim()) {
        toast({
          title: 'Erro',
          description: 'Nome do condomínio é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.endereco.trim()) {
        toast({
          title: 'Erro',
          description: 'Endereço é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.cep.trim()) {
        toast({
          title: 'Erro',
          description: 'CEP é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.cidade.trim()) {
        toast({
          title: 'Erro',
          description: 'Cidade é obrigatória',
          variant: 'destructive'
        });
        return;
      }

      const condominioData = {
        nome: formData.nome.trim(),
        endereco: formData.endereco.trim(),
        cep: formData.cep.trim(),
        cidade: formData.cidade.trim(),
        telefone: formData.telefone.trim() || null,
        sindico_nome: formData.sindico_nome.trim() || null,
        sindico_cpf: formData.sindico_cpf.replace(/\D/g, '') || null,
        sindico_senha: formData.sindico_senha.trim() || null,
        sindico_telefone: formData.sindico_telefone.trim() || null
      };

      console.log('Criando condomínio com dados:', condominioData);

      // Inserção direta (RLS pode estar desabilitado para super admin)
      const { data, error } = await supabase
        .from('condominios')
        .insert(condominioData)
        .select();

      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }

      console.log('Condomínio criado com sucesso:', data);

      toast({
        title: 'Sucesso',
        description: 'Condomínio criado com sucesso!'
      });

      setShowCreateDialog(false);
      setFormData({
        id: '',
        nome: '',
        endereco: '',
        cep: '',
        cidade: '',
        telefone: '',
        sindico_nome: '',
        sindico_cpf: '',
        sindico_senha: '',
        sindico_telefone: ''
      });
      loadData();
    } catch (error: any) {
      console.error('Erro ao criar condomínio:', error);
      
      let errorMessage = 'Falha ao criar condomínio';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      if (error?.details) {
        errorMessage += `: ${error.details}`;
      }
      
      if (error?.hint) {
        errorMessage += ` (Dica: ${error.hint})`;
      }
      
      // Erro específico de políticas RLS
      if (error?.code === '42501' || error?.message?.includes('permission denied')) {
        errorMessage = 'Erro de permissão: O super admin pode não ter permissão para criar condomínios. Verifique as políticas RLS.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCondominio = async (id: string) => {
    // Validar que o ID não está vazio
    if (!id || id === '') {
      toast({
        title: 'Erro',
        description: 'ID do condomínio inválido',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este condomínio? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      console.log('Excluindo condomínio:', id);
      
      const { error } = await supabase
        .from('condominios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir condomínio:', error);
        throw error;
      }
      
      console.log('Condomínio excluído com sucesso');

      toast({
        title: 'Sucesso',
        description: 'Condomínio excluído com sucesso!'
      });
      
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir condomínio:', error);
      
      let errorMessage = 'Falha ao excluir condomínio';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      if (error?.details) {
        errorMessage += `: ${error.details}`;
      }
      
      // Erro específico de políticas RLS
      if (error?.code === '42501' || error?.message?.includes('permission denied')) {
        errorMessage = 'Erro de permissão: O super admin pode não ter permissão para excluir condomínios. Verifique as políticas RLS.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleEditCondominio = (condominio: Condominio) => {
    setEditingCondominio(condominio);
    setFormData({
      id: condominio.id,
      nome: condominio.nome || '',
      endereco: condominio.endereco || '',
      cep: condominio.cep || '',
      cidade: condominio.cidade || '',
      telefone: condominio.telefone || '',
      sindico_nome: condominio.sindico_nome || '',
      sindico_cpf: condominio.sindico_cpf || '',
      sindico_senha: condominio.sindico_senha || '',
      sindico_telefone: condominio.sindico_telefone || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateCondominio = async () => {
    try {
      // Validar que o ID não está vazio
      if (!formData.id || formData.id === '') {
        toast({
          title: 'Erro',
          description: 'ID do condomínio inválido',
          variant: 'destructive'
        });
        return;
      }

      // Validação de campos obrigatórios
      if (!formData.nome.trim()) {
        toast({
          title: 'Erro',
          description: 'Nome do condomínio é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.endereco.trim()) {
        toast({
          title: 'Erro',
          description: 'Endereço é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.cep.trim()) {
        toast({
          title: 'Erro',
          description: 'CEP é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.cidade.trim()) {
        toast({
          title: 'Erro',
          description: 'Cidade é obrigatória',
          variant: 'destructive'
        });
        return;
      }

      const condominioData = {
        nome: formData.nome.trim(),
        endereco: formData.endereco.trim(),
        cep: formData.cep.trim(),
        cidade: formData.cidade.trim(),
        telefone: formData.telefone.trim() || null,
        sindico_nome: formData.sindico_nome.trim() || null,
        sindico_cpf: formData.sindico_cpf.replace(/\D/g, '') || null,
        sindico_senha: formData.sindico_senha.trim() || null,
        sindico_telefone: formData.sindico_telefone.trim() || null
      };

      console.log('Atualizando condomínio:', formData.id, condominioData);

      // Atualização direta
      const { error } = await supabase
        .from('condominios')
        .update(condominioData)
        .eq('id', formData.id);

      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }

      console.log('Condomínio atualizado com sucesso');

      toast({
        title: 'Sucesso',
        description: 'Condomínio atualizado com sucesso!'
      });

      setShowEditDialog(false);
      setEditingCondominio(null);
      setFormData({
        id: '',
        nome: '',
        endereco: '',
        cep: '',
        cidade: '',
        telefone: '',
        sindico_nome: '',
        sindico_cpf: '',
        sindico_senha: '',
        sindico_telefone: ''
      });
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar condomínio:', error);
      
      let errorMessage = 'Falha ao atualizar condomínio';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      if (error?.details) {
        errorMessage += `: ${error.details}`;
      }
      
      if (error?.hint) {
        errorMessage += ` (Dica: ${error.hint})`;
      }
      
      // Erro específico de políticas RLS
      if (error?.code === '42501' || error?.message?.includes('permission denied')) {
        errorMessage = 'Erro de permissão: O super admin pode não ter permissão para atualizar condomínios. Verifique as políticas RLS.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Total Condomínios</CardTitle>
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{condominios.length}</div>
          <p className="text-sm text-muted-foreground">
            Condomínios registrados
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Total Funcionários</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{funcionarios.length}</div>
          <p className="text-sm text-muted-foreground">
            Funcionários ativos
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Total Entregas</CardTitle>
          <Package className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{entregas.length}</div>
          <p className="text-sm text-muted-foreground">
            Entregas registradas
          </p>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Condomínios Recentes</CardTitle>
          <CardDescription>
            Lista dos condomínios mais recentes cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm">Nome</TableHead>
                <TableHead className="text-sm">Cidade</TableHead>
                <TableHead className="text-sm">Telefone</TableHead>
                <TableHead className="text-sm">Síndico</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {condominios.slice(0, 5).map((condominio) => (
                <TableRow key={condominio.id}>
                  <TableCell className="font-medium text-sm">{condominio.nome}</TableCell>
                  <TableCell className="text-sm">{condominio.cidade}</TableCell>
                  <TableCell className="text-sm">{condominio.telefone || '-'}</TableCell>
                  <TableCell className="text-sm">{condominio.sindico_nome || '-'}</TableCell>
                </TableRow>
              ))}
              {condominios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum condomínio cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderCondominios = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Gerenciamento de Condomínios</h2>
        <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Condomínio
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm">Nome</TableHead>
                <TableHead className="text-sm">Endereço</TableHead>
                <TableHead className="text-sm">Cidade</TableHead>
                <TableHead className="text-sm">Telefone</TableHead>
                <TableHead className="text-sm">Síndico</TableHead>
                <TableHead className="text-sm">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {condominios.map((condominio) => {
                // Encontrar funcionários associados a este condomínio
                const funcs = funcionarios.filter(f => f.condominio_id === condominio.id);
                const sindico = funcs.find(f => f.cargo === 'sindico');
                
                return (
                  <TableRow key={condominio.id}>
                    <TableCell className="font-medium text-sm">{condominio.nome}</TableCell>
                    <TableCell className="text-sm">
                      <div className="max-w-[150px] truncate" title={condominio.endereco}>
                        {condominio.endereco}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{condominio.cidade}</TableCell>
                    <TableCell className="text-sm">{condominio.telefone || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {sindico ? (
                        <div>
                          <p>{sindico.nome}</p>
                          <p className="text-xs text-muted-foreground">{sindico.cpf || '-'}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCondominio(condominio)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCondominio(condominio.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {condominios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum condomínio cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderFuncionarios = () => (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold">Gerenciamento de Funcionários</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm">Nome</TableHead>
                <TableHead className="text-sm">CPF</TableHead>
                <TableHead className="text-sm">Cargo</TableHead>
                <TableHead className="text-sm">Condomínio</TableHead>
                <TableHead className="text-sm">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarios.map((func) => {
                const condo = condominios.find(c => c.id === func.condominio_id);
                return (
                  <TableRow key={func.id}>
                    <TableCell className="font-medium text-sm">{func.nome}</TableCell>
                    <TableCell className="text-sm">{func.cpf}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-sm">{func.cargo}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{condo?.nome || 'Não encontrado'}</TableCell>
                    <TableCell>
                      <Badge variant={func.ativo ? "default" : "destructive"} className="text-sm">
                        {func.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {funcionarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum funcionário cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderEntregas = () => (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold">Entregas Recentes</h2>
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm">Data</TableHead>
                <TableHead className="text-sm">Código</TableHead>
                <TableHead className="text-sm">Status</TableHead>
                <TableHead className="text-sm hidden md:table-cell">Condomínio</TableHead>
                <TableHead className="text-sm hidden md:table-cell">Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entregas.map((entrega) => {
                const condo = condominios.find(c => c.id === entrega.condominio_id);
                return (
                  <TableRow key={entrega.id}>
                    <TableCell className="text-sm">{new Date(entrega.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono">
                      <div>
                        <p className="text-sm">{entrega.codigo_retirada}</p>
                        <p className="text-xs text-muted-foreground md:hidden truncate max-w-[100px]">{condo?.nome || 'Não encontrado'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entrega.status === 'entregue' ? "default" : "outline"} className="text-sm">
                        {entrega.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{condo?.nome || 'Não encontrado'}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm hidden md:table-cell">{entrega.observacoes || 'Nenhuma'}</TableCell>
                  </TableRow>
                );
              })}
              {entregas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma entrega registrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
  
  // Componente de relatórios específico para super admin
  // Movendo o estado para fora da função de renderização para evitar problemas de reinicialização
  const [selectedCondominioId, setSelectedCondominioId] = useState<string>('todos');
  
  const renderRelatorios = () => {
    return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Relatórios Administrativos</h2>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-card p-3 rounded-md border shadow-sm w-full sm:w-auto">
          <Label htmlFor="condominio-filter" className="whitespace-nowrap font-semibold">Filtrar por Condomínio:</Label>
          <Select 
            value={selectedCondominioId} 
            onValueChange={setSelectedCondominioId}
          >
            <SelectTrigger className="w-full sm:w-[300px]" id="condominio-filter">
              <SelectValue placeholder="Selecione um condomínio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Condomínios</SelectItem>
              {condominios.map((condo) => (
                <SelectItem key={condo.id} value={condo.id}>
                  {condo.nome} - {condo.cidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-sky-50 p-3 rounded-md border border-sky-200 text-sky-800 text-sm">
        <p className="flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-sky-600 flex-shrink-0" />
          <span className="truncate">
            {selectedCondominioId === 'todos' 
              ? `Exibindo relatórios de todos os ${condominios.length} condomínios cadastrados.` 
              : `Exibindo relatórios detalhados do condomínio selecionado.`
            }
          </span>
        </p>
      </div>
      
      {condominios.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {selectedCondominioId === 'todos' ? (
            // Exibir todos os condomínios (modo compacto)
            condominios.map((condominio) => (
              <Card key={condominio.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <CardTitle>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="truncate">{condominio.nome}</span>
                      <Badge variant="outline">{condominio.cidade}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-3">
                    <AdminReports superAdminMode={true} condominioId={condominio.id} />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Exibir apenas o condomínio selecionado (modo detalhado)
            (() => {
              const condominio = condominios.find(c => c.id === selectedCondominioId);
              if (condominio) {
                return (
                  <Card>
                    <CardHeader className="bg-gray-50">
                      <CardTitle>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <span className="truncate">{condominio.nome}</span>
                          <Badge variant="outline">{condominio.cidade}</Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <AdminReports superAdminMode={true} condominioId={selectedCondominioId} />
                    </CardContent>
                  </Card>
                );
              }
              return (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>Condomínio não encontrado</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedCondominioId('todos')} 
                      className="mt-4"
                    >
                      Voltar para todos os condomínios
                    </Button>
                  </CardContent>
                </Card>
              );
            })()
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p>Nenhum condomínio cadastrado</p>
          </CardContent>
        </Card>
      )}
    </div>
    );
  };

  const renderBranding = () => {
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          setBrandingData(prev => ({
            ...prev,
            logoUrl: event.target?.result as string
          }));
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSaveBranding = async () => {
      if (!logoFile) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione um arquivo de logo primeiro',
          variant: 'destructive'
        });
        return;
      }

      try {
        toast({
          title: 'Processando...',
          description: 'Aplicando seu logo em toda a aplicação...'
        });

        // Usar o LogoProcessor para processar e salvar o logo
        await LogoProcessor.processAndSaveLogos(logoFile, brandingData.appName);

        // Salvar dados do branding no localStorage
        const brandingConfig = {
          ...brandingData,
          logoUrl: brandingData.logoUrl,
          lastUpdated: new Date().toISOString(),
          hasCustomLogo: true
        };
        localStorage.setItem('app_branding', JSON.stringify(brandingConfig));
        
        // Atualizar o contexto imediatamente
        const customLogoUrl = LogoProcessor.getCustomLogoURL();
        updateBranding({
          appName: brandingData.appName,
          appDescription: brandingData.appDescription,
          logoUrl: customLogoUrl || '',
          hasCustomLogo: true
        });
        
        toast({
          title: '🎉 Sucesso!',
          description: 'Seu logo foi aplicado com sucesso! As mudanças já estão visíveis.'
        });
        
      } catch (error) {
        console.error('Erro ao aplicar logo:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao processar o logo. Verifique se o arquivo é válido e tente novamente.',
          variant: 'destructive'
        });
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold">Gerenciamento de Branding</h2>
          <Button 
            onClick={handleSaveBranding} 
            className={`w-full sm:w-auto ${
              logoFile 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!logoFile}
          >
            {logoFile ? '🚀 Aplicar Meu Logo Agora!' : 'Selecione um logo primeiro'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Painel de Configuração */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Aplicação</CardTitle>
              <CardDescription>
                Personalize o nome, descrição e logo da sua aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Nome da Aplicação</Label>
                <Input
                  id="app-name"
                  value={brandingData.appName}
                  onChange={(e) => setBrandingData(prev => ({ ...prev, appName: e.target.value }))}
                  placeholder="Ex: Minha Empresa Entregas"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="app-description">Descrição</Label>
                <Input
                  id="app-description"
                  value={brandingData.appDescription}
                  onChange={(e) => setBrandingData(prev => ({ ...prev, appDescription: e.target.value }))}
                  placeholder="Ex: Sistema de Gestão de Entregas Personalizado"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo da Aplicação</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {logoFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Arquivo selecionado: {logoFile.name}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Recomendado: SVG ou PNG, máximo 2MB. Ideal: 512x512px ou maior
                </p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">🚀 Use SEU Próprio Logo!</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• <strong>CARREGUE SEU ARQUIVO:</strong> Clique em "Escolher arquivo" acima</li>
                  <li>• <strong>FORMATOS ACEITOS:</strong> PNG, JPG, SVG (recomendado)</li>
                  <li>• <strong>FUNDO TRANSPARENTE:</strong> Prefira logos com fundo transparente</li>
                  <li>• <strong>APLICAÇÃO AUTOMÁTICA:</strong> Seu logo será aplicado SEM fundo azul</li>
                  <li>• <strong>TAMANHO MUITO GRANDE:</strong> Logo aparecerá em tamanho 80x80px nos dashboards</li>
                  <li>• <strong>INCLUI:</strong> Porteiro, Síndico, Admin, Super Admin, Login (120px), PWA</li>
                </ul>
                <div className="mt-3 p-3 bg-white rounded border border-green-300">
                  <p className="text-sm font-medium text-green-800">
                    📝 <strong>IMPORTANTE:</strong> Logo aparecerá SEM fundo azul e em tamanho MUITO MAIOR (80x80px)!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Veja como ficará na tela de login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center space-y-4">
                  {/* Logo Preview */}
                  <div className="mx-auto w-20 h-20 flex items-center justify-center">
                    {brandingData.logoUrl ? (
                      <img 
                        src={brandingData.logoUrl} 
                        alt="Seu Logo" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
                        <Package className="h-10 w-10 text-gray-400" />
                        <span className="sr-only">Nenhum logo carregado</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Preview */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {brandingData.appName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {brandingData.appDescription}
                    </p>
                  </div>
                  
                  {/* Status */}
                  {brandingData.logoUrl ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Logo carregado - pronto para aplicar!</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span>Aguardando upload do logo</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  💡 <strong>Dica:</strong> Este é o preview de como aparecerá na tela de login. O logo será aplicado automaticamente em toda a aplicação.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Seção de Arquivos Atuais */}
        <Card>
          <CardHeader>
            <CardTitle>Arquivos de Logo Atuais</CardTitle>
            <CardDescription>
              Gerencie os arquivos de logo da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="font-medium">Logo Principal</div>
                <div className="text-sm text-muted-foreground">/public/icons/Logo.svg</div>
                <div className="text-xs text-green-600 mt-1">✓ Ativo</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-medium">Ícone Base</div>
                <div className="text-sm text-muted-foreground">/public/icons/base-icon.svg</div>
                <div className="text-xs text-green-600 mt-1">✓ Ativo</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-medium">Favicon</div>
                <div className="text-sm text-muted-foreground">/public/favicon.ico</div>
                <div className="text-xs text-green-600 mt-1">✓ Ativo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 pb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Super Admin</h1>
          <p className="text-sm md:text-base text-muted-foreground">Controle total do sistema EntregasZap</p>
        </div>
        <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={onBack}>
          Voltar ao Dashboard
        </Button>
      </div>

      {/* Fixed navigation without horizontal scrolling - responsive grid layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pb-2 mb-2">
        {[
          { key: 'overview', label: 'Visão Geral' },
          { key: 'condominios', label: 'Condomínios' },
          { key: 'funcionarios', label: 'Funcionários' },
          { key: 'entregas', label: 'Entregas' },
          { key: 'relatorios', label: 'Relatórios' },
          { key: 'branding', label: 'Branding' },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={currentView === tab.key ? "default" : "outline"}
            onClick={() => setCurrentView(tab.key as any)}
            className="text-sm md:text-base py-2 h-auto whitespace-normal break-words text-center"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="mt-4 md:mt-6">
        {currentView === 'overview' && renderOverview()}
        {currentView === 'condominios' && renderCondominios()}
        {currentView === 'funcionarios' && renderFuncionarios()}
        {currentView === 'entregas' && renderEntregas()}
        {currentView === 'relatorios' && renderRelatorios()}
        {currentView === 'branding' && renderBranding()}
      </div>

      {/* Dialog para criar condomínio */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Condomínio</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo condomínio abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Condomínio *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Residencial Jardim das Flores"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Ex: São Paulo"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo *</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Ex: Rua das Flores, 123 - Jardim Primavera"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="Ex: 01234-567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="Ex: (11) 1234-5678"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Dados do Síndico (Opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sindico_nome">Nome do Síndico</Label>
                  <Input
                    id="sindico_nome"
                    value={formData.sindico_nome}
                    onChange={(e) => setFormData({ ...formData, sindico_nome: e.target.value })}
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sindico_cpf">CPF do Síndico</Label>
                  <Input
                    id="sindico_cpf"
                    value={formData.sindico_cpf}
                    onChange={(e) => setFormData({ ...formData, sindico_cpf: e.target.value })}
                    placeholder="Ex: 123.456.789-00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="sindico_telefone">Telefone do Síndico</Label>
                  <Input
                    id="sindico_telefone"
                    value={formData.sindico_telefone}
                    onChange={(e) => setFormData({ ...formData, sindico_telefone: e.target.value })}
                    placeholder="Ex: (11) 9876-5432"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sindico_senha">Senha do Síndico</Label>
                  <Input
                    id="sindico_senha"
                    type="password"
                    value={formData.sindico_senha}
                    onChange={(e) => setFormData({ ...formData, sindico_senha: e.target.value })}
                    placeholder="Senha de acesso"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateCondominio}>
              Criar Condomínio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar condomínio */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Condomínio</DialogTitle>
            <DialogDescription>
              Edite os dados do condomínio abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome do Condomínio *</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Residencial Jardim das Flores"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cidade">Cidade *</Label>
                <Input
                  id="edit-cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Ex: São Paulo"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-endereco">Endereço Completo *</Label>
              <Input
                id="edit-endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Ex: Rua das Flores, 123 - Jardim Primavera"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cep">CEP *</Label>
                <Input
                  id="edit-cep"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="Ex: 01234-567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telefone">Telefone</Label>
                <Input
                  id="edit-telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="Ex: (11) 1234-5678"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Dados do Síndico (Opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sindico_nome">Nome do Síndico</Label>
                  <Input
                    id="edit-sindico_nome"
                    value={formData.sindico_nome}
                    onChange={(e) => setFormData({ ...formData, sindico_nome: e.target.value })}
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sindico_cpf">CPF do Síndico</Label>
                  <Input
                    id="edit-sindico_cpf"
                    value={formData.sindico_cpf}
                    onChange={(e) => setFormData({ ...formData, sindico_cpf: e.target.value })}
                    placeholder="Ex: 123.456.789-00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sindico_telefone">Telefone do Síndico</Label>
                  <Input
                    id="edit-sindico_telefone"
                    value={formData.sindico_telefone}
                    onChange={(e) => setFormData({ ...formData, sindico_telefone: e.target.value })}
                    placeholder="Ex: (11) 9876-5432"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sindico_senha">Senha do Síndico</Label>
                  <Input
                    id="edit-sindico_senha"
                    type="password"
                    value={formData.sindico_senha}
                    onChange={(e) => setFormData({ ...formData, sindico_senha: e.target.value })}
                    placeholder="Senha de acesso"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setEditingCondominio(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateCondominio}>
              Atualizar Condomínio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};