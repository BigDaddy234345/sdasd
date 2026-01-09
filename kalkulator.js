// Pobierz element kalkulatora i wyświetlacz wyniku z DOM
const calc = document.querySelector('.calc');
const result = document.querySelector('#result');
// Zmienna do przechowywania instancji wykresu
let myChart = null;

// Dodaj event listener do kalkulatora na kliknięcia przycisków
calc.addEventListener('click', (event) => {
    // Jeśli klikniętym elementem nie jest przycisk, opuść funkcję
    if (!event.target.classList.contains('calc_btn')) return;

    // Pobierz tekst z klikniętego przycisku
    const value = event.target.innerText;

    // Sprawdź czy przycisk to funkcja trygonometryczna
    if (event.target.classList.contains('calc_btn_trig')) {
        // Pobierz typ funkcji z atrybutu data-func i oblicz wykres
        calculateAndDrawChart(event.target.getAttribute('data-func'));
        return;
    }

    // Obsłuż pozostałe operacje za pomocą switch
    switch(value) {
        // Jeśli naciśnięto 'C' - wyczyść wyświetlacz
        case 'C':
            result.innerText = '';
            break;
        // Jeśli naciśnięto '=' - oblicz wynik
        case '=':
            try {
                // Ewaluuj wyrażenie matematyczne
                const evaluated = eval(result.innerText);
                // Wyświetl wynik zaokrąglony do 2 miejsc lub błąd
                result.innerText = isFinite(evaluated) ? Number(evaluated).toFixed(2) : 'Error';
            } catch (e) {
                // Jeśli błąd - wyświetl 'Error'
                result.innerText = 'Error';
            }
            break;
        // Dla pozostałych przycisków - dodaj wartość do wyświetlacza
        default:
            result.innerText += value;
    }
});

/**
 * Oblicza wartość funkcji trygonometrycznej i rysuje wykres
 * @param {string} func - 'sin', 'cos' lub 'tan'
 */
function calculateAndDrawChart(func) {
    // Spróbuj sparsować kąt w stopniach z wyświetlacza
    const angleDeg = parseFloat(result.innerText);
    
    // Jeśli wartość nie jest liczbą - wyświetl błąd
    if (isNaN(angleDeg)) {
        result.innerText = 'Error';
        return;
    }

    // Konwertuj kąt ze stopni na radiany
    const angleRad = angleDeg * (Math.PI / 180);
    
    // Oblicz wartość wybranej funkcji trygonometrycznej
    const calculatedValue = {
        sin: Math.sin(angleRad),
        cos: Math.cos(angleRad),
        tan: Math.tan(angleRad)
    }[func];

    // Wyświetl wynik zaokrąglony do 4 miejsc dziesiętnych
    result.innerText = calculatedValue.toFixed(4);
    // Narysuj wykres funkcji z zaznaczonym punktem wyniku
    drawChart(func, angleDeg, calculatedValue);
}

/**
 * Rysuje wykres funkcji trygonometrycznej
 */
function drawChart(func, activeAngle, activeValue) {
    // Pobierz kontekst canvas do rysowania wykresu
    const ctx = document.getElementById('myChart').getContext('2d');
    // Tablice do przechowywania etykiet i wartości danych
    const labels = [];
    const dataPoints = [];

    // Generuj dane wykresu od -360° do 360° co 10°
    for (let x = -360; x <= 360; x += 10) {
        // Dodaj kąt jako etykietę
        labels.push(x);
        // Konwertuj kąt na radiany
        const rad = x * (Math.PI / 180);
        let value;
        
        // Oblicz wartość funkcji, dla tan ogranicze ekstremalne wartości
        if (func === 'tan') {
            // Jeśli wartość tan przekracza 5, ustaw jako null (nie rysuj)
            value = Math.abs(Math.tan(rad)) > 5 ? null : Math.tan(rad);
        } else {
            // Dla sin i cos oblicz odpowiednią funkcję
            value = func === 'sin' ? Math.sin(rad) : Math.cos(rad);
        }
        // Dodaj obliczoną wartość do tablicy
        dataPoints.push(value);
    }

    // Jeśli wykres już istnieje - zniszcz go
    if (myChart) myChart.destroy();

    // Stwórz nowy wykres za pomocą Chart.js
    myChart = new Chart(ctx, {
        // Typ wykresu - liniowy
        type: 'line',
        // Dane dla wykresu
        data: {
            // Etykiety na osi X (kąty)
            labels,
            // Zbiory danych
            datasets: [
                {
                    // Etykieta dla funkcji (sin, cos lub tan)
                    label: `Funkcja ${func.toUpperCase()}`,
                    // Wartości funkcji
                    data: dataPoints,
                    // Kolor linii
                    borderColor: '#007bff',
                    // Tło pod linią
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    // Gładkość linii
                    tension: 0.4,
                    // Ukryj punkty danych
                    pointRadius: 0,
                    // Grubość linii
                    borderWidth: 2
                },
                {
                    // Etykieta z obliczoną wartością
                    label: `Wynik: ${activeValue.toFixed(4)}`,
                    // Zaznacz tylko punkt wyniku
                    data: labels.map(x => x === activeAngle ? activeValue : null),
                    // Czerwone tło dla punktu
                    backgroundColor: 'red',
                    // Rozmiar punktu
                    pointRadius: 8,
                    // Nie rysuj linii między punktami
                    showLine: false
                }
            ]
        },
        // Opcje konfiguracyjne wykresu
        options: {
            // Wyłącz wszystkie animacje
            animation: false,
            // Wykres responsywny (dopasowuje się do rozmiaru kontenera)
            responsive: true,
            // Zachowaj aspect ratio wykresu
            maintainAspectRatio: false,
            // Opcje pluginów
            plugins: { 
                // Pokaż legendę na górze
                legend: { display: true, position: 'top' } 
            },
            // Konfiguracja osi
            scales: {
                // Oś X (kąty)
                x: { 
                    // Pokaż tytuł osi
                    title: { display: true, text: 'Kąt [stopnie]', font: { size: 14 } } 
                },
                // Oś Y (wartości funkcji)
                y: { 
                    // Pokaż tytuł osi
                    title: { display: true, text: 'Wartość', font: { size: 14 } }, 
                    // Zakres wartości na osi Y
                    min: -2, max: 2 
                }
            }
        }
    });
}