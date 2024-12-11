$(document).ready(function () {
  // Variable pour stocker le timeout
  let timeout;

  // Variable pour stocker le prompt d'installation (PWA)
  let deferredPrompt;

  const apiKey = 'ab8885ca5629418dbcf123332241911';

  // Fonction pour appeler l'API et mettre à jour l'interface
  function fetchWeather(ville) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${ville}&days=4&aqi=no&alerts=no`;

    $.ajax({
      type: 'GET',
      url: url,
      dataType: 'json',
      success: function (data) {
        console.log(data);
        const dayOfWeek = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
        const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
        $('#jour').text(capitalizedDayOfWeek);
        const date = new Date();
        $('#date').text(date.getDate());
        $('#datelongue').text(date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }));
        $('#temperature').text(`${data.current.temp_c}°C`);
        $('#feel').text(`${data.current.feelslike_c}°C`);
        $('#conditions').text(data.current.condition.text);
        $('#iconday').attr('src', `img/${data.current.condition.icon.split('/').pop().split('.')[0]}.svg`);

        // Mise à jour du nom de la ville
        $('#villeNom').text(`${data.location.name}`);
        console.log(data)

        $('#pays').text(`${data.location.country}`)

        // Mise à jour des prévisions pour les jours suivants
        const forecast = data.forecast.forecastday;
        const nextDaysContainer = $('.flex.flex-col.bg-primary.text-white.mt-14.gap-4.rounded-xl');

        // Réinitialiser les jours suivants
        nextDaysContainer.find('.forecast-day').remove();

        // Affichage des 3 jours suivants (à partir de demain)
        forecast.slice(1, 4).forEach((day) => {
          const dayName = new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long' });
          const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

          const icon = `img/${day.day.condition.icon.split('/').pop().split('.')[0]}.svg`;
          const temps = `${day.day.maxtemp_c}°/${day.day.mintemp_c}°`;

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


   // Gestion du bouton iOS
   $('#iosbutton').on('click', function () {
    $('#imageContainer').toggleClass('hidden'); // Afficher/masquer l'image
  });

  // Fonction pour gérer l'événement de saisie dans l'input
  $('#ville').on('input', function () {
    const ville = $(this).val().trim(); // Récupération de la ville

    // On annule le précédent délai si une nouvelle touche est pressée avant 500ms
    clearTimeout(timeout);

    if (ville) {
      // On attend 500ms après la dernière frappe avant d'appeler la fonction fetchWeather
      timeout = setTimeout(function() {
        // N'appeler fetchWeather que si c'est une nouvelle recherche (i.e., ville n'est pas vide)
        fetchWeather(ville);
      }, 500); // Délai de 500ms
    }
  });

  // Ajouter un écouteur d'événements pour la touche "Enter"
  $('#ville').on('keypress', function (e) {
    if (e.key === 13) {
      const ville = $(this).val().trim(); // Récupération de la ville
      if (ville) {
        fetchWeather(ville);
        $('#villeNom').text(` ${ville}`);
      }
    }
  });

  // Afficher la météo à la localisation du téléphone au chargement
  fetchWeatherByLocation();

  // Afficher la météo de Bruxelles si la géolocalisation échoue ou si aucune ville n'est donnée
  fetchWeather('Brussels');

  // Fonction pour afficher/masquer les boutons en fonction du type de périphérique
  function handleDevice() {
    const md = new MobileDetect(window.navigator.userAgent);

    if (md.mobile()) {
      
      // Si mobile, afficher le bouton d'installation (Android ou iOS)
      if (md.is('iOS')) {
        $('#iosbutton').removeClass('hidden').show();
        $('#installAppButton').hide();
      } else if (md.is('AndroidOS')) {
        $('#installAppButton').removeClass('hidden').show();
        $('#iosbutton').hide();
      }
    } else {
      // Si desktop, cacher les boutons d'installation
      $('#installAppButton').hide();
      $('#iosbutton').hide();
    }
  }

  // Appeler la fonction pour gérer les appareils mobiles
  handleDevice();

  // Gérer l'installation de l'application PWA
  window.addEventListener('beforeinstallprompt', (e) => {
    // Empêcher l'affichage du prompt d'installation par défaut
    e.preventDefault();
    deferredPrompt = e;
    // Afficher le bouton d'installation
    $('#installAppButton').show();
  });

  // Écouter le clic sur le bouton d'installation
  $('#installAppButton').on('click', async () => {
    // Afficher le prompt d'installation
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      console.log(`Résultat d'installation: ${result.outcome}`);
      deferredPrompt = null;
      $('#installAppButton').hide(); // Masquer le bouton après l'installation
    }
  });

});

// Fonction pour récupérer les coordonnées GPS et afficher la météo correspondante
function fetchWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const location = `${latitude},${longitude}`;
        fetchWeather(location);

        // Mettre à jour le champ input avec le nom de la ville
        const reverseGeocodeUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=no`;

        $.ajax({
          type: 'GET',
          url: reverseGeocodeUrl,
          dataType: 'json',
          success: function (data) {
            $('#ville').val(data.location.name);
          },
        });
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        // En cas d'erreur, afficher la météo de Bruxelles par défaut
        fetchWeather('Brussels');
        $('#ville').val('Brussels');
      }
    );
  } else {
    console.error('Géolocalisation non prise en charge par ce navigateur.');
    // Afficher la météo de Bruxelles par défaut
    fetchWeather('Brussels');
    $('#ville').val('Brussels');
  }
}
