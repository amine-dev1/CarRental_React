import { Users } from 'lucide-react';
import Card from '../../components/Card';

export default function Customers() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <Users className="text-secondary" />
                Gestion des clients
            </h1>
            <Card>
                <div className="text-center py-12">
                    <p className="text-text-secondary">Fonctionnalités de gestion des clients bientôt disponibles...</p>
                </div>
            </Card>
        </div>
    );
}
