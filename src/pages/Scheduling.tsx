import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  User,
  Stethoscope,
  CreditCard,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Professional {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  photo_url: string | null;
  address: string | null;
  whatsapp: string | null;
  commission_rate: number | null;
}

interface ExistingAppointment {
  appointment_date: string;
  appointment_time: string;
  professional_id: string;
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const SERVICES = [
  { value: "consulta-gestante", label: "Consulta Gestante", price: 150 },
  { value: "consulta-pos-parto", label: "Consulta Pós-Parto", price: 150 },
  { value: "amamentacao", label: "Consultoria de Amamentação", price: 200 },
  { value: "shantala", label: "Shantala (Massagem Bebê)", price: 120 },
  { value: "banho-ofuro", label: "Banho & Ofurô", price: 100 },
  { value: "laserterapia", label: "Laserterapia Mamária", price: 180 },
  { value: "cuidados-recem-nascido", label: "Cuidados Recém-Nascido", price: 130 },
  { value: "acompanhamento-mensal", label: "Acompanhamento Mensal", price: 250 },
];

const Scheduling = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<ExistingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  // Step control
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      fetchExistingAppointments();
    }
  }, [selectedProfessional, selectedDate]);

  const fetchProfessionals = async () => {
    const { data } = await supabase
      .from("professionals")
      .select("id, name, specialty, bio, photo_url, address, whatsapp, commission_rate")
      .eq("is_active", true);
    setProfessionals(data || []);
    setLoading(false);
  };

  const fetchExistingAppointments = async () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { data } = await supabase
      .from("appointments")
      .select("appointment_date, appointment_time, professional_id")
      .eq("professional_id", selectedProfessional)
      .eq("appointment_date", dateStr);
    setExistingAppointments(data || []);
  };

  const getAvailableSlots = () => {
    if (!selectedDate) return TIME_SLOTS;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const bookedTimes = existingAppointments
      .filter((a) => a.appointment_date === dateStr && a.professional_id === selectedProfessional)
      .map((a) => a.appointment_time.slice(0, 5));
    return TIME_SLOTS.filter((t) => !bookedTimes.includes(t));
  };

  const selectedServiceData = SERVICES.find((s) => s.value === selectedService);
  const selectedProfessionalData = professionals.find((p) => p.id === selectedProfessional);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Faça login para agendar.");
      navigate("/auth");
      return;
    }
    if (!selectedDate || !selectedTime || !selectedProfessional || !selectedService || !paymentMethod) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      client_id: user.id,
      professional_id: selectedProfessional,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      appointment_time: selectedTime,
      service: selectedServiceData?.label || selectedService,
      price: selectedServiceData?.price || 0,
      location: selectedProfessionalData?.address || null,
      payment_method: paymentMethod,
      notes: notes.slice(0, 400) || null,
      status: "scheduled",
    });
    setSubmitting(false);

    if (error) {
      toast.error("Erro ao agendar. Tente novamente.");
      console.error(error);
    } else {
      setSuccess(true);
      toast.success("Agendamento realizado com sucesso! 🎉");
    }
  };

  const canProceedStep1 = !!selectedProfessional;
  const canProceedStep2 = !!selectedDate && !!selectedTime;
  const canProceedStep3 = !!selectedService && !!paymentMethod;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-display text-xl">Carregando...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <CheckCircle2 className="h-20 w-20 text-mint mx-auto" />
          <h1 className="font-display text-3xl font-bold text-foreground">Agendamento Confirmado!</h1>
          <div className="bg-card rounded-xl p-6 shadow-card space-y-3 text-left">
            <p className="text-sm text-muted-foreground">
              <User className="inline h-4 w-4 mr-1" />
              {selectedProfessionalData?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <CalendarDays className="inline h-4 w-4 mr-1" />
              {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-sm text-muted-foreground">
              <Clock className="inline h-4 w-4 mr-1" />
              {selectedTime}
            </p>
            <p className="text-sm text-muted-foreground">
              <Stethoscope className="inline h-4 w-4 mr-1" />
              {selectedServiceData?.label}
            </p>
            <p className="text-sm font-semibold text-primary">
              R$ {selectedServiceData?.price.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à loja
              </Button>
            </Link>
            <Button onClick={() => { setSuccess(false); setStep(1); setSelectedDate(undefined); setSelectedTime(""); setSelectedService(""); setPaymentMethod(""); setNotes(""); }}>
              Novo Agendamento
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary fill-primary/30" />
              <h1 className="font-display text-lg font-bold text-primary">Agendamento</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-2xl py-6 px-4 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => { if (s < step) setStep(s); }}
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  step === s
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : step > s
                      ? "bg-primary/20 text-primary cursor-pointer"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {s}
              </button>
              {s < 3 && (
                <div className={cn("h-0.5 w-8 rounded-full", step > s ? "bg-primary/40" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Choose professional */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h2 className="font-display text-xl font-bold text-foreground">Escolha o Profissional</h2>
                <p className="text-sm text-muted-foreground mt-1">Selecione quem vai cuidar de você</p>
              </div>

              {professionals.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhum profissional disponível no momento.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {professionals.map((pro) => (
                    <Card
                      key={pro.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-hover-lift",
                        selectedProfessional === pro.id && "ring-2 ring-primary shadow-soft"
                      )}
                      onClick={() => setSelectedProfessional(pro.id)}
                    >
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-accent flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                          {pro.photo_url ? (
                            <img src={pro.photo_url} alt={pro.name} className="h-full w-full rounded-full object-cover" />
                          ) : (
                            pro.name.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-foreground">{pro.name}</h3>
                          {pro.specialty && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <Stethoscope className="h-3 w-3 mr-1" />
                              {pro.specialty}
                            </Badge>
                          )}
                          {pro.bio && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{pro.bio}</p>
                          )}
                          {pro.address && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {pro.address}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Button
                className="w-full"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
              >
                Próximo: Escolher data e horário
              </Button>
            </motion.div>
          )}

          {/* Step 2: Choose date & time */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h2 className="font-display text-xl font-bold text-foreground">Data e Horário</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Agendando com <span className="text-primary font-semibold">{selectedProfessionalData?.name}</span>
                </p>
              </div>

              <Card>
                <CardContent className="p-4 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setSelectedTime(""); }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0}
                    locale={ptBR}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </CardContent>
              </Card>

              {selectedDate && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Horários disponíveis — {format(selectedDate, "dd/MM")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getAvailableSlots().length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum horário disponível nesta data.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {getAvailableSlots().map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedTime === slot ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                >
                  Próximo: Serviço e pagamento
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Service, payment & confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h2 className="font-display text-xl font-bold text-foreground">Serviço e Pagamento</h2>
                <p className="text-sm text-muted-foreground mt-1">Finalize seu agendamento</p>
              </div>

              {/* Summary */}
              <Card className="bg-rose-light/30 border-primary/20">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Profissional
                    </span>
                    <span className="font-semibold text-foreground">{selectedProfessionalData?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> Data
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedDate && format(selectedDate, "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Horário
                    </span>
                    <span className="font-semibold text-foreground">{selectedTime}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Service selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" /> Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label} — R$ {s.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedServiceData && (
                    <p className="mt-2 text-lg font-bold text-primary text-right">
                      R$ {selectedServiceData.price.toFixed(2)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payment method */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" /> Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="crypto">Criptomoeda</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Observações</CardTitle>
                  <CardDescription>Até 400 caracteres (opcional)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 400))}
                    placeholder="Alguma observação para o profissional..."
                    className="resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{notes.length}/400</p>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canProceedStep3 || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? "Agendando..." : "Confirmar Agendamento"}
                </Button>
              </div>

              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  Você precisa{" "}
                  <Link to="/auth" className="text-primary underline">fazer login</Link>{" "}
                  para confirmar o agendamento.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Scheduling;
