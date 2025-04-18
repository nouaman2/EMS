import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FeedChart from '../Chart/FeedChart';
import { dashboardConfigs } from './dashboardTypes/multiPuissance'; // Supposé contenir les configurations pour tous les types
import { checkAvailableFeeds } from '../../services/emonAPI';

const DashboardView = () => {
  const { type } = useParams(); // Récupère le paramètre dynamique "type" depuis l'URL
  const [loading, setLoading] = useState(true); // État pour indiquer si les données sont en cours de chargement
  const [error, setError] = useState(null); // État pour gérer les erreurs
  const [chartData, setChartData] = useState(null); // État pour stocker les données du graphique
  
  useEffect(() => {
    // Fonction pour récupérer les données du tableau de bord en fonction du type
    const fetchDashboardData = async () => {
      try {
        const config = dashboardConfigs[type]; // Récupère la configuration en fonction du type
        if (!config) {
          throw new Error(`Type de tableau de bord "${type}" introuvable`);
        }

        const data = await config.fetchData(); // Récupère les données en utilisant la configuration
        //console.log('Données récupérées :', data);
        setChartData(data); // Met à jour les données du graphique


        setLoading(false); // Indique que le chargement est terminé
      } catch (err) {
        setError('Échec du chargement des données du tableau de bord'); // Définit un message d'erreur
        setLoading(false); // Arrête le chargement
        console.error('Erreur lors de la récupération des données du tableau de bord :', err);
      }
    };

    fetchDashboardData(); // Appelle la fonction pour récupérer les données
  }, [type]); // Réexécute l'effet lorsque le type change

  useEffect(() => {
    // Fonction pour vérifier les flux disponibles
    const checkFeeds = async () => {
      const feeds = await checkAvailableFeeds(); // Appelle l'API pour vérifier les flux
      ////console.log('Flux disponibles :', feeds);
    };
    checkFeeds(); // Appelle la fonction pour vérifier les flux
  }, []); // Exécute cet effet une seule fois après le montage du composant

  // Affiche un message de chargement si les données sont en cours de récupération
  if (loading) return <div className="loading">Chargement du tableau de bord...</div>;

  // Affiche un message d'erreur si une erreur s'est produite
  if (error) return <div className="error">{error}</div>;

  // Récupère la configuration pour le type actuel
  const config = dashboardConfigs[type];
  if (!config) {
    // Affiche un message d'erreur si le type est invalide
    return <div className="error">Type de tableau de bord invalide : {type}</div>;
  }

  return (
    <div className="dashboard-view">
      {/* Titre du tableau de bord */}
      <h2 className="dashboard-title">
        {config.title}
      </h2>
      <div className="chart-container">
        {/* Composant FeedChart pour afficher les données sous forme de graphique */}
        <FeedChart
          data={chartData.datasets.map(d => ({
            label: d.label,
            data: d.data
          }))}
          feedName={config.feedName || type} // Nom du flux ou type comme valeur par défaut
          {...config.chartProps} // Propriétés supplémentaires pour le graphique
        />
      </div>
    </div>
  );
};

export default DashboardView;