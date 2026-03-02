import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Bell, 
  History, 
  Fingerprint, 
  MapPin, 
  LogIn, 
  LogOut, 
  Home, 
  FileText, 
  Settings,
  ChevronRight,
  Clock,
  Plus,
  Minus,
  Save,
  AlertCircle,
  ShieldCheck,
  Users,
  Search,
  Download,
  Trash2,
  Edit2,
  UserPlus,
  Calendar,
  X
} from 'lucide-react';
import { PontoRecord, Screen, WorkSchedule, DaySchedule, UserRole, Employee } from './types';

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp1', name: 'João Silva', role: 'Desenvolvedor Full Stack', department: 'Engenharia', registration: '884291-0', hiringDate: '2022-01-15', salary: 5500 },
  { id: 'emp2', name: 'Maria Santos', role: 'Designer UI/UX', department: 'Produto', registration: '884292-1', hiringDate: '2022-03-20', salary: 4800 },
  { id: 'emp3', name: 'Pedro Costa', role: 'Gerente de Projetos', department: 'Operações', registration: '884293-2', hiringDate: '2021-11-10', salary: 7200 },
  { id: 'emp4', name: 'Ana Oliveira', role: 'Analista de QA', department: 'Engenharia', registration: '884294-3', hiringDate: '2023-05-05', salary: 4200 },
  { id: 'emp5', name: 'Nathanael Souza', role: 'Colaborador', department: 'Geral', registration: '001', hiringDate: '2026-03-01', salary: 0 },
];

const MOCK_ADMIN: Employee = {
  id: 'admin',
  name: 'Administrador',
  role: 'Gestor de RH',
  department: 'Administração',
  registration: 'admin123',
  hiringDate: '2020-01-01',
  salary: 8500
};

const INITIAL_SCHEDULE: WorkSchedule = {
  'Segunda': { start: '08:00', end: '17:00', isWorkDay: true },
  'Terça': { start: '08:00', end: '17:00', isWorkDay: true },
  'Quarta': { start: '08:00', end: '17:00', isWorkDay: true },
  'Quinta': { start: '08:00', end: '17:00', isWorkDay: true },
  'Sexta': { start: '08:00', end: '17:00', isWorkDay: true },
  'Sábado': { start: '08:00', end: '12:00', isWorkDay: false },
  'Domingo': { start: '08:00', end: '12:00', isWorkDay: false },
};

const HOLIDAYS = [
  '01/01', // Ano Novo
  '21/04', // Tiradentes
  '01/05', // Dia do Trabalho
  '07/09', // Independência
  '12/10', // Aparecida
  '02/11', // Finados
  '15/11', // Proclamação
  '25/12', // Natal
];

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loginName, setLoginName] = useState('');
  const [loginRegistration, setLoginRegistration] = useState('');
  const [employeeLoginError, setEmployeeLoginError] = useState('');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<PontoRecord[]>([
    {
      id: '1',
      employeeId: 'emp1',
      type: 'Entrada',
      timestamp: new Date(new Date().setHours(8, 0, 0)),
      location: 'Sede Central - Bloco A',
      isExtra: false
    }
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>(INITIAL_SCHEDULE);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployeeData, setNewEmployeeData] = useState<Omit<Employee, 'id'>>({
    name: '',
    role: '',
    department: '',
    registration: '',
    hiringDate: new Date().toISOString().split('T')[0],
    salary: 0
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('pt-BR', options).replace(/^\w/, (c) => c.toUpperCase());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatMinutes = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const handleRegister = () => {
    const userRecords = records.filter(r => r.employeeId === currentUser?.id);
    const lastRecord = userRecords[0];
    const newType = lastRecord?.type === 'Entrada' ? 'Saída' : 'Entrada';
    
    const dayMonth = `${currentTime.getDate().toString().padStart(2, '0')}/${(currentTime.getMonth() + 1).toString().padStart(2, '0')}`;
    const isHoliday = HOLIDAYS.includes(dayMonth);
    const isSunday = currentTime.getDay() === 0;
    const hour = currentTime.getHours();
    const day = currentTime.getDay();
    const isFriday = day === 5;
    const isMonToThu = day >= 1 && day <= 4;

    let isExtra = false;
    let extraPercentage: 50 | 100 | undefined = undefined;

    if (isSunday || isHoliday) {
      isExtra = true;
      extraPercentage = 100;
    } else if (isMonToThu) {
      if (hour < 8 || hour >= 18) {
        isExtra = true;
        extraPercentage = 50;
      }
    } else if (isFriday) {
      if (hour < 8 || hour >= 17) {
        isExtra = true;
        extraPercentage = 50;
      }
    } else {
      // Saturday
      isExtra = true;
      extraPercentage = 50;
    }

    const newRecord: PontoRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: currentUser?.id || 'emp1',
      type: newType,
      timestamp: new Date(),
      location: 'Sede Central - Bloco A',
      isExtra,
      extraPercentage
    };
    
    setRecords([newRecord, ...records]);
  };

  const handleEmployeeLogin = () => {
    // Check for admin login first
    if (loginName.toLowerCase() === 'admin' && loginRegistration === 'admin123') {
      setCurrentUser(MOCK_ADMIN);
      setUserRole('admin');
      setEmployeeLoginError('');
      setLoginName('');
      setLoginRegistration('');
      setCurrentScreen('reports');
      return;
    }

    const employee = employees.find(
      emp => emp.name.toLowerCase() === loginName.toLowerCase() && emp.registration === loginRegistration
    );

    if (employee) {
      setCurrentUser(employee);
      setUserRole('employee');
      setEmployeeLoginError('');
      setLoginName('');
      setLoginRegistration('');
    } else {
      setEmployeeLoginError('Nome ou matrícula não encontrados.');
    }
  };

  const handleAddEmployee = (newEmployee: Omit<Employee, 'id'>) => {
    const employee: Employee = {
      ...newEmployee,
      id: `emp${employees.length + 1}-${Math.random().toString(36).substr(2, 5)}`
    };
    setEmployees([...employees, employee]);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    if (selectedEmployeeId === id) setSelectedEmployeeId(null);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    if (currentUser?.id === updatedEmployee.id) {
      setCurrentUser(updatedEmployee);
    }
  };

  const isDateInMonth = (date: Date, monthStr: string) => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const parts = monthStr.split(' ');
    if (parts.length !== 2) return true;
    const [mName, year] = parts;
    return monthNames[date.getMonth()] === mName && date.getFullYear().toString() === year;
  };

  const calculateEmployeeHours = (employeeId: string, allRecords: PontoRecord[], monthFilter?: string) => {
    const empRecords = allRecords
      .filter(r => r.employeeId === employeeId)
      .filter(r => monthFilter ? isDateInMonth(r.timestamp, monthFilter) : true)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let normalMinutes = 0;
    let extra50Minutes = 0;
    let extra100Minutes = 0;

    const pairs: { entry: Date, exit: Date }[] = [];
    for (let i = 0; i < empRecords.length; i++) {
      if (empRecords[i].type === 'Entrada' && empRecords[i+1]?.type === 'Saída') {
        pairs.push({ entry: empRecords[i].timestamp, exit: empRecords[i+1].timestamp });
        i++; 
      }
    }

    pairs.forEach(({ entry, exit }) => {
      let current = new Date(entry);
      current.setSeconds(0, 0);
      const exitTime = new Date(exit);
      exitTime.setSeconds(0, 0);

      while (current < exitTime) {
        const day = current.getDay(); 
        const hour = current.getHours();
        const dayMonth = `${current.getDate().toString().padStart(2, '0')}/${(current.getMonth() + 1).toString().padStart(2, '0')}`;
        const isHoliday = HOLIDAYS.includes(dayMonth);

        if (day === 0 || isHoliday) {
          extra100Minutes++;
        } else if (day >= 1 && day <= 4) {
          if (hour >= 8 && hour < 18) {
            normalMinutes++;
          } else {
            extra50Minutes++;
          }
        } else if (day === 5) {
          if (hour >= 8 && hour < 17) {
            normalMinutes++;
          } else {
            extra50Minutes++;
          }
        } else {
          // Saturday (day 6)
          extra50Minutes++;
        }
        current.setMinutes(current.getMinutes() + 1);
      }
    });

    return { normalMinutes, extra50Minutes, extra100Minutes };
  };

  const handleDownloadReport = (employee: Employee, month: string) => {
    const empRecords = records
      .filter(r => r.employeeId === employee.id && isDateInMonth(r.timestamp, month))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const pairs: { entry: Date, exit: Date, location: string }[] = [];
    for (let i = 0; i < empRecords.length; i++) {
      if (empRecords[i].type === 'Entrada' && empRecords[i+1]?.type === 'Saída') {
        pairs.push({ 
          entry: empRecords[i].timestamp, 
          exit: empRecords[i+1].timestamp,
          location: empRecords[i].location
        });
        i++; 
      }
    }

    let totalNormal = 0;
    let total50 = 0;
    let total100 = 0;

    const rows = pairs.map(pair => {
      const breakdown = calculateEmployeeHours(employee.id, [
        { id: '1', employeeId: employee.id, type: 'Entrada', timestamp: pair.entry, location: pair.location },
        { id: '2', employeeId: employee.id, type: 'Saída', timestamp: pair.exit, location: pair.location }
      ]);
      
      totalNormal += breakdown.normalMinutes;
      total50 += breakdown.extra50Minutes;
      total100 += breakdown.extra100Minutes;

      const classifications = [];
      if (breakdown.normalMinutes > 0) classifications.push('Normal');
      if (breakdown.extra50Minutes > 0) classifications.push('Extra 50%');
      if (breakdown.extra100Minutes > 0) classifications.push('Extra 100%');

      return [
        pair.entry.toLocaleDateString('pt-BR'),
        formatTime(pair.entry),
        formatTime(pair.exit),
        classifications.join(' / '),
        formatMinutes(breakdown.normalMinutes),
        formatMinutes(breakdown.extra50Minutes),
        formatMinutes(breakdown.extra100Minutes),
        formatMinutes(breakdown.normalMinutes + breakdown.extra50Minutes + breakdown.extra100Minutes)
      ];
    });

    const csvContent = [
      ['Relatorio de Ponto Detalhado - ' + month],
      ['Funcionario', employee.name],
      ['Matricula', employee.registration],
      ['Departamento', employee.department],
      [''],
      ['Data', 'Entrada', 'Saida', 'Classificacao', 'Normal', 'Extra 50%', 'Extra 100%', 'Total'],
      ...rows,
      [''],
      ['RESUMO FINAL'],
      ['Total Horas Normais', formatMinutes(totalNormal)],
      ['Total Horas Extra 50%', formatMinutes(total50)],
      ['Total Horas Extra 100%', formatMinutes(total100)],
      ['TOTAL GERAL', formatMinutes(totalNormal + total50 + total100)]
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Relatorio_${employee.name.replace(/\s+/g, '_')}_${month.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [profileSubScreen, setProfileSubScreen] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    notifications: true,
    biometrics: true,
    reminder: false,
    darkMode: true
  });

  useEffect(() => {
    if (currentScreen !== 'profile') {
      setProfileSubScreen(null);
      setIsEditingSchedule(false);
    }
  }, [currentScreen]);

  const ProfileSubHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            setProfileSubScreen(null);
            setIsEditingSchedule(false);
          }}
          className="size-10 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50"
        >
          <ChevronRight className="size-5 text-slate-400 rotate-180" />
        </button>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {action}
    </div>
  );

  const updateSchedule = (day: string, field: 'start' | 'end' | 'isWorkDay', value: string | boolean) => {
    setWorkSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const calculateDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const grossDuration = Math.max(0, endTotal - startTotal);
    
    // Calcular trabalho no período da manhã (07:00 - 11:59)
    const morningStart = 7 * 60; // 07:00
    const morningEnd = 11 * 60 + 59; // 11:59
    const overlapStart = Math.max(startTotal, morningStart);
    const overlapEnd = Math.min(endTotal, morningEnd);
    const morningWork = Math.max(0, overlapEnd - overlapStart);

    // Descontar 1 hora (60 min) se trabalhou pelo menos 4 horas (240 min) na manhã
    return morningWork >= 240 ? grossDuration - 60 : grossDuration;
  };

  const calculateWeeklyHours = () => {
    const totalMinutes = (Object.values(workSchedule) as DaySchedule[])
      .filter(d => d.isWorkDay)
      .reduce((acc, day) => acc + calculateDuration(day.start, day.end), 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const calculateTodayTotal = () => {
    if (!currentUser) return "00h 00m";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRecords = [...records].filter(r => {
      const rDate = new Date(r.timestamp);
      rDate.setHours(0, 0, 0, 0);
      return rDate.getTime() === today.getTime() && r.employeeId === currentUser.id;
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let totalMinutes = 0;
    let morningWorkMinutes = 0;
    const morningStart = 7 * 60;
    const morningEnd = 11 * 60 + 59;

    for (let i = 0; i < todayRecords.length; i += 2) {
      const entrada = todayRecords[i];
      const saida = todayRecords[i + 1];
      
      let startT, endT;
      if (entrada && saida && entrada.type === 'Entrada' && saida.type === 'Saída') {
        startT = entrada.timestamp.getHours() * 60 + entrada.timestamp.getMinutes();
        endT = saida.timestamp.getHours() * 60 + saida.timestamp.getMinutes();
        totalMinutes += (saida.timestamp.getTime() - entrada.timestamp.getTime()) / (1000 * 60);
      } else if (entrada && entrada.type === 'Entrada' && !saida) {
        startT = entrada.timestamp.getHours() * 60 + entrada.timestamp.getMinutes();
        endT = currentTime.getHours() * 60 + currentTime.getMinutes();
        totalMinutes += (currentTime.getTime() - entrada.timestamp.getTime()) / (1000 * 60);
      }

      if (startT !== undefined && endT !== undefined) {
        const overlapStart = Math.max(startT, morningStart);
        const overlapEnd = Math.min(endT, morningEnd);
        morningWorkMinutes += Math.max(0, overlapEnd - overlapStart);
      }
    }

    // Descontar 1 hora (60 min) se trabalhou pelo menos 4 horas (240 min) na manhã
    const netMinutes = morningWorkMinutes >= 240 ? totalMinutes - 60 : totalMinutes;

    const hours = Math.floor(netMinutes / 60);
    const minutes = Math.floor(netMinutes % 60);
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  };

  return (
    <div className="min-h-screen bg-[#102217] text-slate-100 flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 space-y-8"
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="size-20 rounded-3xl bg-primary/20 flex items-center justify-center border-2 border-primary/30 shadow-[0_0_40px_-10px_rgba(13,242,108,0.3)]">
                <Fingerprint className="size-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Ponto Digital</h1>
                <p className="text-slate-400 text-sm mt-1">Acesse sua conta para registrar seu ponto</p>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary transition-all text-white"
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Matrícula</label>
                <input 
                  type="text" 
                  value={loginRegistration}
                  onChange={(e) => setLoginRegistration(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary transition-all text-white"
                  placeholder="Sua matrícula"
                />
              </div>

              {employeeLoginError && (
                <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-wider bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                  <AlertCircle className="size-4" />
                  <span>{employeeLoginError}</span>
                </div>
              )}

              <button 
                onClick={handleEmployeeLogin}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-[#102217] shadow-[0_0_30px_-5px_rgba(13,242,108,0.4)] active:scale-[0.98] transition-all"
              >
                Entrar no Sistema
              </button>
            </div>

            <p className="text-[10px] text-slate-600 text-center max-w-[200px]">
              Em caso de perda da matrícula, entre em contato com o RH.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="app-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <header className="flex items-center justify-between p-4 sticky top-0 bg-[#102217]/80 backdrop-blur-md z-20">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <User className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Bom dia,</p>
                  <p className="text-sm font-bold">{currentUser.name}</p>
                </div>
              </div>
              <button className="size-10 flex items-center justify-center rounded-full bg-slate-800/50 border border-slate-700/50 relative">
                <Bell className="size-5 text-slate-300" />
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-[#102217]"></span>
              </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 pb-24 overflow-y-auto">
              <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Clock Section */}
              <div className="flex flex-col items-center py-8">
                <h1 className="text-6xl font-extrabold tracking-tighter text-white">
                  {formatTime(currentTime)}
                </h1>
                <p className="text-primary font-medium mt-1 text-sm">
                  {formatDate(currentTime)}
                </p>
                {((!workSchedule[currentTime.toLocaleDateString('pt-BR', { weekday: 'long' }).replace(/^\w/, (c) => c.toUpperCase()).split('-')[0]]?.isWorkDay) || HOLIDAYS.includes(`${currentTime.getDate().toString().padStart(2, '0')}/${(currentTime.getMonth() + 1).toString().padStart(2, '0')}`)) && (
                  <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
                    <AlertCircle className="size-3 text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                      Hora Extra {currentTime.getDay() === 0 || HOLIDAYS.includes(`${currentTime.getDate().toString().padStart(2, '0')}/${(currentTime.getMonth() + 1).toString().padStart(2, '0')}`) ? '100%' : '50%'} Ativa
                    </span>
                  </div>
                )}
              </div>

              {/* Last Record Card */}
              <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                    <History className="size-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Último registro</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">
                        {records[0] ? `${formatTime(records[0].timestamp)} - ${records[0].type}` : '--:--'}
                      </p>
                      {records[0]?.isExtra && (
                        <span className="text-[8px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded uppercase">
                          Extra {records[0].extraPercentage}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total hoje</p>
                  <p className="font-bold text-primary text-sm">{calculateTodayTotal()}</p>
                </div>
              </div>

              {/* Main Action Button */}
              <div className="flex flex-col items-center gap-6 py-4">
                <button 
                  onClick={handleRegister}
                  className="group relative flex h-52 w-52 items-center justify-center rounded-full bg-primary shadow-[0_0_50px_-10px_rgba(13,242,108,0.4)] active:scale-95 transition-all duration-300"
                >
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-[ping_3s_linear_infinite]"></div>
                  <div className="flex flex-col items-center text-[#102217]">
                    <Fingerprint className="size-16 mb-2 stroke-[2.5]" />
                    <span className="font-black text-xs uppercase tracking-[0.2em]">Registrar Ponto</span>
                  </div>
                </button>
                <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-800/30 px-4 py-2 rounded-full border border-slate-700/30">
                  <MapPin className="size-3.5 text-primary" />
                  <span>Você está no local de trabalho</span>
                </div>
              </div>

              {/* Map Preview */}
              <div className="overflow-hidden rounded-2xl border border-slate-700/50 h-32 relative bg-slate-800/50">
                <img 
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000" 
                  alt="Mapa de localização"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102217] via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(13,242,108,0.8)]"></div>
                  <span className="text-xs font-semibold text-white">Sede Central - Bloco A</span>
                </div>
              </div>

              {/* Today's Log */}
              <div className="space-y-3 pb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Registros de Hoje</h3>
                <div className="bg-slate-800/20 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50">
                  {records.filter(r => r.employeeId === currentUser.id).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-lg flex items-center justify-center ${record.type === 'Entrada' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'}`}>
                          {record.type === 'Entrada' ? <LogIn className="size-4" /> : <LogOut className="size-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{record.type}</span>
                          {record.isExtra && (
                            <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">
                              Hora Extra {record.extraPercentage}%
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-sm">{formatTime(record.timestamp)}</span>
                    </div>
                  ))}
                  {records.length < 2 && (
                    <div className="flex items-center justify-between p-4 opacity-50">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-slate-700/30 flex items-center justify-center">
                          <LogOut className="size-4 text-slate-500" />
                        </div>
                        <span className="font-medium text-sm italic">Pendente...</span>
                      </div>
                      <span className="text-slate-500 text-sm">--:--</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentScreen === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pt-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Histórico</h2>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/50">
                  <Clock className="size-4 text-primary" />
                  <span className="text-xs font-bold">Este Mês</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-400">Hoje, {currentTime.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Ativo</span>
                  </div>
                  <div className="space-y-4">
                    {records.filter(r => r.employeeId === currentUser.id).map((record) => (
                      <div key={record.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-lg flex items-center justify-center ${record.type === 'Entrada' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'}`}>
                            {record.type === 'Entrada' ? <LogIn className="size-4" /> : <LogOut className="size-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold">{record.type}</p>
                              {record.isExtra && (
                                <span className="text-[8px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded uppercase">
                                  Extra {record.extraPercentage}%
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500">{record.location}</p>
                          </div>
                        </div>
                        <span className="font-bold text-sm">{formatTime(record.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {[
                  { date: '28 Fev', hours: '08h 12m', entries: [{ t: '08:02', type: 'Entrada' }, { t: '17:14', type: 'Saída' }] },
                  { date: '27 Fev', hours: '07h 55m', entries: [{ t: '08:10', type: 'Entrada' }, { t: '17:05', type: 'Saída' }] },
                ].map((day, idx) => (
                  <div key={idx} className="bg-slate-800/20 rounded-2xl p-4 border border-slate-700/30 opacity-70">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-slate-500">{day.date}</span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-700/30 px-2 py-1 rounded">{day.hours}</span>
                    </div>
                    <div className="space-y-2">
                      {day.entries.map((e, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-slate-500">{e.type}</span>
                          <span className="font-bold text-slate-400">{e.t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentScreen === 'management' && userRole === 'admin' && (
            <motion.div
              key="management"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pt-4 pb-24"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestão de Equipe</h2>
                <button 
                  onClick={() => setIsAddingEmployee(true)}
                  className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20"
                >
                  <UserPlus className="size-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar funcionário..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-3">
                {employees.filter(emp => 
                  emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  emp.registration.includes(searchTerm)
                ).map((emp) => (
                  <div 
                    key={emp.id}
                    className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/30">
                        <User className="size-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{emp.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider">
                          <span>{emp.registration}</span>
                          <span>•</span>
                          <span>{emp.role}</span>
                        </div>
                        {emp.hiringDate && (
                          <div className="flex items-center gap-1 text-[9px] text-slate-600 mt-0.5">
                            <Calendar className="size-3" />
                            <span>Contratado em {new Date(emp.hiringDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                        {emp.salary !== undefined && (
                          <p className="text-[10px] font-bold text-primary mt-1">{formatCurrency(emp.salary)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingEmployee(emp)}
                        className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="size-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Employee Modal */}
              <AnimatePresence>
                {isAddingEmployee && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Novo Funcionário</h3>
                        <button onClick={() => setIsAddingEmployee(false)} className="text-slate-500"><X /></button>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                            value={newEmployeeData.name}
                            onChange={e => setNewEmployeeData({...newEmployeeData, name: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Matrícula</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                              value={newEmployeeData.registration}
                              onChange={e => setNewEmployeeData({...newEmployeeData, registration: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Data Contratação</label>
                            <input 
                              type="date" 
                              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                              value={newEmployeeData.hiringDate}
                              onChange={e => setNewEmployeeData({...newEmployeeData, hiringDate: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cargo</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                            value={newEmployeeData.role}
                            onChange={e => setNewEmployeeData({...newEmployeeData, role: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                            value={newEmployeeData.department}
                            onChange={e => setNewEmployeeData({...newEmployeeData, department: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Salário Base (R$)</label>
                          <input 
                            type="number" 
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                            value={newEmployeeData.salary || ''}
                            onChange={e => setNewEmployeeData({...newEmployeeData, salary: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          handleAddEmployee(newEmployeeData);
                          setIsAddingEmployee(false);
                          setNewEmployeeData({ name: '', role: '', department: '', registration: '', hiringDate: new Date().toISOString().split('T')[0], salary: 0 });
                        }}
                        className="w-full py-4 bg-primary text-[#102217] rounded-2xl font-black text-xs uppercase tracking-widest"
                      >
                        Salvar Funcionário
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Edit Employee Modal */}
              <AnimatePresence>
                {editingEmployee && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Editar Funcionário</h3>
                        <button onClick={() => setEditingEmployee(null)} className="text-slate-500"><X /></button>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                            value={editingEmployee.name}
                            onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Matrícula</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                              value={editingEmployee.registration}
                              onChange={e => setEditingEmployee({...editingEmployee, registration: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Data Contratação</label>
                            <input 
                              type="date" 
                              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                              value={editingEmployee.hiringDate || ''}
                              onChange={e => setEditingEmployee({...editingEmployee, hiringDate: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cargo</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                            value={editingEmployee.role}
                            onChange={e => setEditingEmployee({...editingEmployee, role: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                            value={editingEmployee.department}
                            onChange={e => setEditingEmployee({...editingEmployee, department: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Salário Base (R$)</label>
                          <input 
                            type="number" 
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary"
                            value={editingEmployee.salary || ''}
                            onChange={e => setEditingEmployee({...editingEmployee, salary: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          handleUpdateEmployee(editingEmployee);
                          setEditingEmployee(null);
                        }}
                        className="w-full py-4 bg-primary text-[#102217] rounded-2xl font-black text-xs uppercase tracking-widest"
                      >
                        Salvar Alterações
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentScreen === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pt-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {userRole === 'admin' ? 'Painel Administrativo' : 'Relatórios'}
                </h2>
                {userRole === 'admin' && selectedEmployeeId && (
                  <button 
                    onClick={() => setSelectedEmployeeId(null)}
                    className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20"
                  >
                    Voltar à Lista
                  </button>
                )}
              </div>

              {userRole === 'admin' && !selectedEmployeeId ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Buscar funcionário..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:border-primary transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Colaboradores</h3>
                    {employees.filter(emp => 
                      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      emp.registration.includes(searchTerm)
                    ).map((emp) => (
                      <button 
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployeeId(emp.id);
                          setSearchTerm('');
                        }}
                        className="w-full flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/30">
                            <User className="size-5 text-slate-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm group-hover:text-primary transition-colors">{emp.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{emp.role}</p>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-slate-600 group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : userRole === 'admin' && selectedEmployeeId ? (
                <div className="space-y-6">
                  {/* Employee Summary Card */}
                  {(() => {
                    const emp = employees.find(e => e.id === selectedEmployeeId);
                    if (!emp) return null;
                    
                    // Get current month string (e.g., "Março 2026")
                    const currentMonthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                    const currentMonthStr = `${currentMonthNames[currentTime.getMonth()]} ${currentTime.getFullYear()}`;
                    
                    const { normalMinutes, extra50Minutes, extra100Minutes } = calculateEmployeeHours(emp.id, records, currentMonthStr);

                    return (
                      <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <User className="size-7 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{emp.name}</h3>
                            <p className="text-xs text-slate-400">{emp.department} • {emp.registration}</p>
                            {emp.hiringDate && (
                              <p className="text-[10px] text-slate-500 mt-1">Contratado em: {new Date(emp.hiringDate).toLocaleDateString('pt-BR')}</p>
                            )}
                            {emp.salary !== undefined && (
                              <p className="text-xs font-bold text-primary mt-1">Salário: {formatCurrency(emp.salary)}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="px-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Totais de {currentMonthStr}</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/30">
                              <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Normais</p>
                              <p className="text-sm font-black text-white">{formatMinutes(normalMinutes)}</p>
                            </div>
                            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/30">
                              <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Extra 50%</p>
                              <p className="text-sm font-black text-orange-500">{formatMinutes(extra50Minutes)}</p>
                            </div>
                            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/30">
                              <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Extra 100%</p>
                              <p className="text-sm font-black text-red-500">{formatMinutes(extra100Minutes)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Relatórios Disponíveis</h3>
                      <Download className="size-4 text-primary" />
                    </div>
                    
                    {['Fevereiro 2026', 'Janeiro 2026', 'Dezembro 2025'].map((month, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/20 rounded-2xl border border-slate-700/30">
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-slate-500" />
                          <span className="font-semibold text-sm">{month}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const emp = employees.find(e => e.id === selectedEmployeeId);
                              if (emp) handleDownloadReport(emp, month);
                            }}
                            className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                  <div className="size-20 rounded-full bg-slate-800 flex items-center justify-center">
                    <FileText className="size-10 text-slate-500" />
                  </div>
                  <h2 className="text-xl font-bold">Relatórios</h2>
                  <p className="text-slate-400 text-sm max-w-[250px]">
                    Seus relatórios mensais estarão disponíveis aqui em breve.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {currentScreen === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pt-4"
            >
              <AnimatePresence mode="wait">
                {!profileSubScreen ? (
                  <motion.div
                    key="profile-main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col items-center space-y-3 py-6">
                      <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 p-1">
                        <div className="size-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                          <User className="size-12 text-primary" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h2 className="text-xl font-bold">{currentUser.name}</h2>
                        <p className="text-slate-400 text-xs">{currentUser.role}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { id: 'personal', icon: User, label: 'Dados Pessoais' },
                        { id: 'schedule', icon: Clock, label: 'Jornada de Trabalho' },
                        { id: 'settings', icon: Settings, label: 'Configurações' },
                      ].map((item) => (
                        <button 
                          key={item.id} 
                          onClick={() => setProfileSubScreen(item.id)}
                          className="w-full flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="size-5 text-slate-400" />
                            <span className="font-semibold text-sm">{item.label}</span>
                          </div>
                          <ChevronRight className="size-4 text-slate-600" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : profileSubScreen === 'personal' ? (
                  <motion.div
                    key="personal-data"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <ProfileSubHeader title="Dados Pessoais" />
                    <div className="space-y-4">
                      {[
                        { label: 'Nome Completo', value: currentUser.name },
                        { label: 'Matrícula', value: currentUser.registration },
                        { label: 'Departamento', value: currentUser.department },
                        { label: 'Data de Admissão', value: currentUser.hiringDate ? new Date(currentUser.hiringDate).toLocaleDateString('pt-BR') : 'N/A' },
                      ].map((info, idx) => (
                        <div key={idx} className="bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{info.label}</p>
                          <p className="font-bold text-sm">{info.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : profileSubScreen === 'schedule' ? (
                  <motion.div
                    key="work-schedule"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <ProfileSubHeader 
                      title="Jornada de Trabalho" 
                      action={
                        <button 
                          onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isEditingSchedule ? 'bg-primary text-[#102217] border-primary' : 'bg-slate-800/50 text-slate-300 border-slate-700/50'}`}
                        >
                          {isEditingSchedule ? <Save className="size-4" /> : <Settings className="size-4" />}
                          <span className="text-xs font-bold">{isEditingSchedule ? 'Salvar' : 'Editar'}</span>
                        </button>
                      }
                    />
                    
                    <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Carga Horária Semanal</span>
                        <span className="text-lg font-black text-primary">
                          {calculateWeeklyHours()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(Object.entries(workSchedule) as [string, DaySchedule][]).map(([day, schedule]) => (
                        <div 
                          key={day} 
                          className={`flex flex-col p-4 rounded-2xl border transition-all ${schedule.isWorkDay ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-800/10 border-slate-700/10 opacity-60'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`font-bold text-sm ${schedule.isWorkDay ? 'text-white' : 'text-slate-500'}`}>{day}</span>
                              {!schedule.isWorkDay && <span className="text-[8px] font-black bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded uppercase tracking-widest">Extra</span>}
                            </div>
                            {isEditingSchedule && (
                              <button 
                                onClick={() => updateSchedule(day, 'isWorkDay', !schedule.isWorkDay)}
                                className={`size-6 rounded-lg flex items-center justify-center transition-all ${schedule.isWorkDay ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}
                              >
                                {schedule.isWorkDay ? <Minus className="size-4" /> : <Plus className="size-4" />}
                              </button>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Entrada</p>
                              {isEditingSchedule ? (
                                <input 
                                  type="time" 
                                  value={schedule.start}
                                  onChange={(e) => updateSchedule(day, 'start', e.target.value)}
                                  className="bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-xs w-full text-white outline-none focus:border-primary"
                                />
                              ) : (
                                <p className="text-sm font-bold text-slate-300">{schedule.start}</p>
                              )}
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Saída</p>
                              {isEditingSchedule ? (
                                <input 
                                  type="time" 
                                  value={schedule.end}
                                  onChange={(e) => updateSchedule(day, 'end', e.target.value)}
                                  className="bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-xs w-full text-white outline-none focus:border-primary"
                                />
                              ) : (
                                <p className="text-sm font-bold text-slate-300">{schedule.end}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <ProfileSubHeader title="Configurações" />
                    <div className="space-y-3">
                      {[
                        { id: 'notifications', label: 'Notificações Push' },
                        { id: 'biometrics', label: 'Autenticação Biométrica' },
                        { id: 'reminder', label: 'Lembrete de Ponto' },
                        { id: 'darkMode', label: 'Modo Escuro Automático' },
                      ].map((setting) => (
                        <button 
                          key={setting.id} 
                          onClick={() => setSettings(prev => ({ ...prev, [setting.id]: !prev[setting.id as keyof typeof settings] }))}
                          className="w-full flex items-center justify-between p-4 bg-slate-800/20 rounded-2xl border border-slate-700/30"
                        >
                          <span className="font-semibold text-sm">{setting.label}</span>
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${settings[setting.id as keyof typeof settings] ? 'bg-primary' : 'bg-slate-700'}`}>
                            <div className={`size-4 bg-white rounded-full transition-transform ${settings[setting.id as keyof typeof settings] ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                        </button>
                      ))}
                      <button 
                        onClick={() => {
                          setCurrentUser(null);
                          setUserRole('employee');
                        }}
                        className="w-full mt-6 p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 font-bold text-sm"
                      >
                        Sair da Conta
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-800/50 bg-[#102217]/90 backdrop-blur-xl px-4 pb-8 pt-3 z-30">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <NavButton 
                  active={currentScreen === 'home'} 
                  onClick={() => setCurrentScreen('home')}
                  icon={Home}
                  label="Início"
                />
                <NavButton 
                  active={currentScreen === 'history'} 
                  onClick={() => setCurrentScreen('history')}
                  icon={History}
                  label="Histórico"
                />
                <NavButton 
                  active={currentScreen === 'reports'} 
                  onClick={() => setCurrentScreen('reports')}
                  icon={FileText}
                  label="Relatórios"
                />
                {userRole === 'admin' && (
                  <NavButton 
                    active={currentScreen === 'management'} 
                    onClick={() => setCurrentScreen('management')}
                    icon={Users}
                    label="Gestão"
                  />
                )}
                <NavButton 
                  active={currentScreen === 'profile'} 
                  onClick={() => setCurrentScreen('profile')}
                  icon={User}
                  label="Perfil"
                />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-primary' : 'text-slate-500'}`}
    >
      <div className={`p-1 rounded-xl transition-all ${active ? 'bg-primary/10' : ''}`}>
        <Icon className={`size-6 ${active ? 'fill-primary/20' : ''}`} />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="size-1 bg-primary rounded-full mt-0.5"
        />
      )}
    </button>
  );
}
