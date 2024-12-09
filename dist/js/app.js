$(document).ready(function () {
  // Variable pour stocker le timeout
  let timeout;

  // Fonction pour appeler l'API et mettre à jour l'interface
  function fetchWeather(ville) {
    const apiKey = 'ab8885ca5629418dbcf123332241911';
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
        $('#villeNom').text(`Météo à : ${data.location.name}`);

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

        // Effacer l'input après avoir récupéré et affiché les données
        $('#ville').val('');
      },
      error: function() {
        // Gestion des erreurs (par exemple, si la ville est invalide)
        alert('La ville n\'a pas pu être trouvée. Veuillez essayer avec un autre nom.');
      }
    });
  }

  // Fonction pour gérer l'événement de saisie dans l'input
  $('#ville').on('input', function () {
    const ville = $(this).val().trim(); // Récupération de la ville

    // On annule le précédent délai si une nouvelle touche est pressée avant 500ms
    clearTimeout(timeout);

    if (ville) {
      // On attend 500ms après la dernière frappe avant d'appeler la fonction fetchWeather
      timeout = setTimeout(function() {
        fetchWeather(ville); // Appel à la fonction de récupération météo
      }, 500); // Délai de 500ms
    }
  });

  // Afficher la météo à la localisation du téléphone au chargement
  fetchWeatherByLocation();

  // Afficher la météo de Bruxelles si la géolocalisation échoue ou si aucune ville n'est donnée
  fetchWeather('Brussels');
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
        const apiKey = 'ab8885ca5629418dbcf123332241911';
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
