import { useState } from "react";
import { X, Calendar, Clock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Professional {
  id: string;
  name: string;
  specialty: string | null;
}

interface AppointmentModalProps {
  professional: Professional;
  onClose: () => void;
}

const timeSlots = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"];

const AppointmentModal = ({ professional, onClose }: AppointmentModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const minDate = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Faca login para agendar!");
      onClose();
      navigate("/auth");
      return;
    }
    if (!date || !time || !clientName) {
      toast.error("Preencha nome, data e horario!");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("appointments").insert({
      professional_id: professional.id,
      client_id: user.id,
      client_name: clientName,
      client_phone: clientPhone || null,
      date,
      time,
      specialty: professional.specialty,
      notes: notes || null,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao agendar: " + error.message);
    } else {
      toast.success("Agendamento solicitado! Aguarde confirmacao.");
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-background w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
          <div>
            <h2 className="font-semibold text-lg">Agendar consulta</h2>
            <p className="text-sm text-muted-foreground">{professional.name} - {professional.specialty}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Seu nome</label>
            <Input placeholder="Nome completo" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />WhatsApp</label>
            <Input placeholder="(00) 00000-0000" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Data</label>
            <Input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Horario</label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                    time === slot
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Observacoes (opcional)</label>
            <Input placeholder="Alguma informacao adicional..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={loading}>
            {loading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentModal;
