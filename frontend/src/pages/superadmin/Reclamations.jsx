import { useEffect, useState } from "react";
import { api } from "../../api/http";
import PageHeader from "../../components/landing/dashboard/PageHeader";
import { useTheme } from "../../context/ThemeContext";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Filter, 
  MessageSquare,
  TrendingUp,
  Building2,
  User,
  Calendar,
  Paperclip,
  X
} from "lucide-react";

export default function Reclamations() {
  const { darkMode } = useTheme();
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReclamations = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (filterPriority) params.append("priority", filterPriority);

      const data = await api(`/api/reclamations/all/list?${params.toString()}`);
      setReclamations(data);
    } catch (err) {
      console.error("Failed to fetch reclamations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamations();
  }, [filterStatus, filterPriority]);

  const updateStatus = async (id, newStatus) => {
    try {
      setSubmitting(true);
      await api(`/api/reclamations/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchReclamations();
      if (selectedReclamation?.id === id) {
        const updated = await api(`/api/reclamations/${id}`);
        setSelectedReclamation(updated);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const submitResponse = async () => {
    if (!response.trim() || !selectedReclamation) return;

    try {
      setSubmitting(true);
      await api(`/api/reclamations/${selectedReclamation.id}/response`, {
        method: "PUT",
        body: JSON.stringify({ response }),
      });
      await fetchReclamations();
      const updated = await api(`/api/reclamations/${selectedReclamation.id}`);
      setSelectedReclamation(updated);
      setResponse("");
    } catch (err) {
      console.error("Failed to submit response:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return darkMode ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-50 text-red-700 border-red-200";
      case "high":
        return darkMode ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-orange-50 text-orange-700 border-orange-200";
      case "medium":
        return darkMode ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-50 text-blue-700 border-blue-200";
      case "low":
        return darkMode ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return darkMode ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return darkMode ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "in_progress":
        return darkMode ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-50 text-blue-700 border-blue-200";
      case "resolved":
        return darkMode ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-50 text-green-700 border-green-200";
      case "closed":
        return darkMode ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return darkMode ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "in_progress":
        return <TrendingUp size={16} />;
      case "resolved":
        return <CheckCircle2 size={16} />;
      case "closed":
        return <X size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Réclamations"
        subtitle="Gérez les réclamations des entreprises"
      />

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${darkMode ? "bg-[#111827] border-white/10" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={18} className={darkMode ? "text-gray-400" : "text-gray-600"} />
            <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Filtres:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm border ${
              darkMode
                ? "bg-[#1F2937] border-white/10 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="closed">Fermé</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm border ${
              darkMode
                ? "bg-[#1F2937] border-white/10 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">Toutes les priorités</option>
            <option value="urgent">Urgent</option>
            <option value="high">Élevé</option>
            <option value="medium">Moyen</option>
            <option value="low">Faible</option>
          </select>

          {(filterStatus || filterPriority) && (
            <button
              onClick={() => {
                setFilterStatus("");
                setFilterPriority("");
              }}
              className={`text-sm px-3 py-2 rounded-lg ${
                darkMode
                  ? "text-blue-400 hover:bg-blue-500/10"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Reclamations List */}
      {loading ? (
        <div className="text-center py-12">
          <div className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Chargement...</div>
        </div>
      ) : reclamations.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${darkMode ? "bg-[#111827] border-white/10" : "bg-white border-gray-200"}`}>
          <FileText size={48} className={`mx-auto mb-3 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
          <div className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Aucune réclamation
          </div>
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
            {filterStatus || filterPriority ? "Essayez de modifier vos filtres" : "Les réclamations apparaîtront ici"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reclamations.map((rec) => (
            <div
              key={rec.id}
              onClick={() => setSelectedReclamation(rec)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                darkMode
                  ? "bg-[#111827] border-white/10 hover:border-blue-500/50 hover:bg-[#1a2332]"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className={`font-semibold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {rec.subject}
                    </h3>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                      <AlertCircle size={14} />
                      {rec.priority === "urgent" ? "Urgent" : rec.priority === "high" ? "Élevé" : rec.priority === "medium" ? "Moyen" : "Faible"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(rec.status)}`}>
                      {getStatusIcon(rec.status)}
                      {rec.status === "pending" ? "En attente" : rec.status === "in_progress" ? "En cours" : rec.status === "resolved" ? "Résolu" : "Fermé"}
                    </span>
                  </div>

                  <p className={`text-sm line-clamp-2 mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {rec.message}
                  </p>

                  <div className="flex items-center gap-4 flex-wrap text-xs">
                    <div className={`flex items-center gap-1.5 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      <Building2 size={14} />
                      <span>{rec.enterprise_name}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      <User size={14} />
                      <span>{rec.user_name} ({rec.user_role})</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      <Calendar size={14} />
                      <span>{new Date(rec.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {rec.attachment_url && (
                      <div className={`flex items-center gap-1.5 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                        <Paperclip size={14} />
                        <span>Pièce jointe</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReclamation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedReclamation(null)}>
          <div
            className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
              darkMode ? "bg-[#111827]" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 p-6 border-b ${darkMode ? "border-white/10 bg-[#111827]" : "border-gray-200 bg-white"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedReclamation.subject}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getPriorityColor(selectedReclamation.priority)}`}>
                      <AlertCircle size={16} />
                      {selectedReclamation.priority === "urgent" ? "Urgent" : selectedReclamation.priority === "high" ? "Élevé" : selectedReclamation.priority === "medium" ? "Moyen" : "Faible"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(selectedReclamation.status)}`}>
                      {getStatusIcon(selectedReclamation.status)}
                      {selectedReclamation.status === "pending" ? "En attente" : selectedReclamation.status === "in_progress" ? "En cours" : selectedReclamation.status === "resolved" ? "Résolu" : "Fermé"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReclamation(null)}
                  className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                >
                  <X size={24} className={darkMode ? "text-gray-400" : "text-gray-600"} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Entreprise</div>
                  <div className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedReclamation.enterprise_name}</div>
                </div>
                <div>
                  <div className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Soumis par</div>
                  <div className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedReclamation.user_name}</div>
                </div>
                <div>
                  <div className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Rôle</div>
                  <div className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedReclamation.user_role === "director" ? "Directeur" : "Agent"}</div>
                </div>
                <div>
                  <div className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Date</div>
                  <div className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{new Date(selectedReclamation.created_at).toLocaleString("fr-FR")}</div>
                </div>
              </div>

              {/* Message */}
              <div>
                <div className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Message</div>
                <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-gray-50"}`}>
                  <p className={darkMode ? "text-gray-300" : "text-gray-700"}>{selectedReclamation.message}</p>
                </div>
              </div>

              {/* Attachment */}
              {selectedReclamation.attachment_url && (
                <div>
                  <div className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Pièce jointe</div>
                  <a
                    href={selectedReclamation.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      darkMode
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <Paperclip size={18} />
                    Voir la pièce jointe
                  </a>
                </div>
              )}

              {/* Response */}
              {selectedReclamation.response && (
                <div>
                  <div className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Votre réponse</div>
                  <div className={`p-4 rounded-xl border-l-4 ${darkMode ? "bg-blue-500/10 border-blue-500" : "bg-blue-50 border-blue-500"}`}>
                    <p className={darkMode ? "text-gray-300" : "text-gray-700"}>{selectedReclamation.response}</p>
                  </div>
                </div>
              )}

              {/* Add Response */}
              <div>
                <div className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {selectedReclamation.response ? "Mettre à jour la réponse" : "Ajouter une réponse"}
                </div>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Écrivez votre réponse ici..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? "bg-[#1F2937] border-white/10 text-gray-200 placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                />
                <button
                  onClick={submitResponse}
                  disabled={!response.trim() || submitting}
                  className={`mt-3 px-6 py-2.5 rounded-lg font-medium ${
                    !response.trim() || submitting
                      ? darkMode
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {submitting ? "Envoi..." : "Envoyer la réponse"}
                </button>
              </div>

              {/* Update Status */}
              <div>
                <div className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Changer le statut</div>
                <div className="flex gap-2 flex-wrap">
                  {["pending", "in_progress", "resolved", "closed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedReclamation.id, status)}
                      disabled={submitting || selectedReclamation.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        selectedReclamation.status === status
                          ? getStatusColor(status)
                          : darkMode
                          ? "border-white/10 text-gray-400 hover:bg-white/5"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {status === "pending" ? "En attente" : status === "in_progress" ? "En cours" : status === "resolved" ? "Résolu" : "Fermé"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
