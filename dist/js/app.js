$(document).ready(function () {
  // Fonction pour appeler l'API et mettre à jour l'interface
  function fetchWeather(ville) {
    const apiKey = 'ab8885ca5629418dbcf123332241911';
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${ville}&days=4&aqi=no&alerts=no`;

    $.ajax({
      type: 'GET',
      url: url,
      dataType: 'json',
      success: function (data) {
        const dayOfWeek = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
        console.log(data)
        const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1); // 
        $('#jour').text(capitalizedDayOfWeek);
        const date = new Date();
        $('#date').text(date.getDate());
        $('#datelongue').text(date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })); // Mois et année
        $('#temperature').text(`${data.current.temp_c}°C`);
        $('#conditions').text(data.current.condition.text);
        $('#iconday').attr('src', `img/${data.current.condition.icon.split('/').pop().split('.')[0]}.svg`);
        // Mise à jour des prévisions pour les jours suivants
        const forecast = data.forecast.forecastday;
        const nextDaysContainer = $('.flex.flex-col.bg-primary.text-white.mt-14.gap-4.rounded-xl'); // Conteneur des prévisions

        // Réinitialiser les jours suivants
        nextDaysContainer.find('.forecast-day').remove();

        // Affichage des 3 jours suivants (à partir de demain)
        forecast.slice(1, 4).forEach((day, index) => {
          // Nom du jour avec la première lettre en majuscule
          const dayName = new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long' });
          const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1); // Capitalisation

          const icon = `img/${day.day.condition.icon.split('/').pop().split('.')[0]}.svg`; // Icon
          const temps = `${day.day.maxtemp_c}°/${day.day.mintemp_c}°`; // Températures

          // Génération du HTML pour chaque jour
          const dayHtml = `
            <div class="w-11/12 flex items-center justify-around bg-single mx-auto py-4 rounded-xl forecast-day">
              <h2>${capitalizedDayName}</h2>
              <img src="${icon}" alt="icon">
              <h2>${temps}</h2>
            </div>
          `;

          nextDaysContainer.append(dayHtml);
        });
      },
    });
  }

  // Écouteur sur le champ input pour détecter la touche Entrée
  $('#ville').on('keypress', function () {
    const ville = $(this).val().trim(); // Récupération de la ville
    fetchWeather(ville); // Appel à la fonction de récupération météo
  });

  // Afficher par défaut Bruxelles au chargement
  fetchWeather('Brussels');
  $('#ville').val('Brussels'); // Mettre "Brussels" dans le champ input par défaut
});

let deferredPrompt;
const installButton = document.createElement('button');
installButton.style.display = 'none';
installButton.textContent = 'Installer l\'application';

// Ajout de styles CSS pour rendre le bouton visible
installButton.style.backgroundColor = 'yellow'; // Couleur de fond jaune
installButton.style.color = 'black'; // Couleur du texte noir
installButton.style.padding = '10px 20px'; // Padding (espace interne)
installButton.style.border = 'none'; // Supprime la bordure par défaut
installButton.style.borderRadius = '5px'; // Coins arrondis
installButton.style.cursor = 'pointer'; // Curseur en mode clic
installButton.style.fontSize = '16px'; // Taille de la police
installButton.style.fontWeight = 'bold'; // Texte en gras
installButton.style.right = '20px'; // Position horizontale (à 20px de la droite)
installButton.style.marginTop = '20px'; // Ajouter une marge au-dessus du bouton

// Détection si l'installation est possible
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Vérification de la plateforme
    if (/iPhone|iPad|iPod/.test(navigator.platform)) {
        installButton.textContent = 'Installation non disponible sur iOS';
        installButton.disabled = true;
    } else {
        installButton.style.display = 'block';
    }
    
    document.body.appendChild(installButton);
});

// Gestion du clic sur le bouton d'installation
installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    const result = await deferredPrompt.prompt();
    console.log(`Installation ${result.outcome}`);
    deferredPrompt = null;
    installButton.style.display = 'none';
});

// Détection si l'app est déjà installée
window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installButton.style.display = 'none';
});
