import { CalendarRange } from 'lucide-react';
import Card from '../../components/Card';

export default function Rentals() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <CalendarRange className="text-secondary" />
                Gestion des locations
            </h1>
            <Card>
                <div className="text-center py-12">
                    <p className="text-text-secondary">Fonctionnalités de gestion des locations bientôt disponibles...</p>
                </div>
            </Card>
        </div>
    );
}
