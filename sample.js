/* 1,000 invented sample rows for trying a long list. */
(function () {
  'use strict';
  /* 1,000 invented sample rows, to try a long list. Every name and price here is made up. */
  window.AD_SAMPLE = function (n) {
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, pick = function (a) { return a[Math.floor(rnd() * a.length)]; };
    var q = function (v) { return /[",\n]/.test(v) ? '"' + String(v).replace(/"/g, '""') + '"' : v; };
    var houses = ['Ashgrove', 'Bellbird', 'Cinder Hill', 'Dovecote', 'Elm Row', 'Fernbank', 'Greywater', 'Hollow Oak', 'Ironbark', 'Juniper Lane', 'Kestrel', 'Larkspur', 'Mossgate', 'Northfold', 'Old Quarry', 'Pipers Creek', 'Quillon', 'Redgum Flat', 'Saltmarsh', 'Tanglewood', 'Underhill', 'Verity', 'Wattle Ridge', 'Yarrabend', 'Zephyr Point'];
    var T = [
      ['red', ['Shiraz', 'Pinot Noir', 'Cabernet Sauvignon', 'Grenache', 'Tempranillo', 'Nebbiolo', 'Merlot', 'Sangiovese', 'Malbec', 'Gamay'], ['Barossa Valley', 'Yarra Valley', 'Margaret River', 'McLaren Vale', 'Rioja', 'Piedmont', 'Hunter Valley', 'Tuscany', 'Mendoza', 'Beaujolais'], [14, 32], [62, 240], ['Dark fruit, soft spice and a long finish.', 'Bright red berries and fine tannin.', 'Savoury, earthy and medium-bodied.', 'Plush, ripe and full-bodied.'], 250],
      ['white', ['Chardonnay', 'Riesling', 'Sauvignon Blanc', 'Pinot Gris', 'Semillon', 'Chenin Blanc', 'Vermentino', 'Fiano', 'Grüner Veltliner', 'Albariño'], ['Adelaide Hills', 'Clare Valley', 'Marlborough', 'Mornington Peninsula', 'Hunter Valley', 'Loire Valley', 'Tasmania', 'Eden Valley', 'Wachau', 'Rías Baixas'], [13, 28], [58, 190], ['Citrus, stone fruit and a clean finish.', 'Crisp, dry and mineral.', 'Textured, with gentle oak.', 'Aromatic, fresh and light.'], 200],
      ['sparkling', ['Brut', 'Blanc de Blancs', 'Rosé Brut', 'Extra Brut', 'Prosecco', 'Pét-Nat'], ['Tasmania', 'Champagne', 'Veneto', 'Adelaide Hills', 'Yarra Valley'], [15, 38], [70, 320], ['Fine bubbles, green apple and brioche.', 'Dry, bright and refreshing.', 'Red berries and a creamy finish.'], 70],
      ['rose', ['Rosé', 'Grenache Rosé', 'Pinot Noir Rosé', 'Sangiovese Rosé'], ['Provence', 'Barossa Valley', 'Yarra Valley', 'McLaren Vale'], [13, 22], [56, 120], ['Pale, dry and strawberry-scented.', 'Crisp, with watermelon and citrus.'], 40],
      ['fortified', ['Tawny', 'Muscat', 'Fino Sherry', 'Pedro Ximénez', 'Late Harvest Riesling'], ['Rutherglen', 'Jerez', 'Douro', 'Barossa Valley'], [12, 24], [0, 0], ['Raisin, toffee and roasted nuts.', 'Sweet, rich and long.'], 40],
      ['sake', ['Junmai', 'Junmai Ginjo', 'Junmai Daiginjo', 'Honjozo', 'Nigori'], ['Niigata', 'Hyogo', 'Akita', 'Kyoto'], [14, 30], [80, 260], ['Clean, with melon and soft rice notes.', 'Dry, light and savoury.'], 60],
      ['whisky', ['10 Year Old', '12 Year Old', '15 Year Old', '18 Year Old', 'Single Cask', 'Sherry Cask', 'Peated', 'Bourbon Cask', 'Rye'], ['Speyside', 'Islay', 'Highlands', 'Tasmania', 'Kentucky', 'Japan'], [14, 60], [0, 0], ['Honey, vanilla and toasted oak.', 'Smoke, sea salt and dried fruit.', 'Dried fruit, spice and dark chocolate.'], 120],
      ['gin', ['Dry Gin', 'Navy Strength Gin', 'Citrus Gin', 'Barrel-Aged Gin', 'Botanical Gin'], ['Sydney', 'Melbourne', 'London', 'Tasmania', 'Kangaroo Island'], [13, 22], [0, 0], ['Juniper, citrus peel and a dry finish.', 'Bright, floral and fresh.'], 60],
      ['rum', ['White Rum', 'Aged Rum 8 Year', 'Aged Rum 12 Year', 'Spiced Rum', 'Agricole'], ['Barbados', 'Jamaica', 'Queensland', 'Martinique', 'Guatemala'], [13, 30], [0, 0], ['Caramel, banana and warm spice.', 'Dry, grassy and bright.'], 45],
      ['tequila', ['Blanco', 'Reposado', 'Añejo', 'Extra Añejo'], ['Jalisco', 'Los Altos'], [14, 40], [0, 0], ['Cooked agave, citrus and pepper.', 'Vanilla, oak and soft agave.'], 35],
      ['mezcal', ['Espadín', 'Tobalá', 'Ensamble'], ['Oaxaca', 'Durango'], [16, 38], [0, 0], ['Smoke, roasted agave and tropical fruit.'], 20],
      ['vodka', ['Vodka', 'Rye Vodka', 'Potato Vodka'], ['Poland', 'France', 'Tasmania'], [12, 20], [0, 0], ['Clean, soft and neutral.'], 15],
      ['aperitif', ['Bitter Aperitivo', 'Dry Vermouth', 'Sweet Vermouth', 'Amaro', 'Limoncello'], ['Turin', 'Milan', 'Adelaide Hills', 'Sicily'], [11, 18], [0, 0], ['Bittersweet orange and herbs.', 'Herbal, warm and gently bitter.'], 25],
      ['cocktail', ['Negroni', 'Old Fashioned', 'Martini', 'Spritz', 'Sour', 'Highball', 'Margarita', 'Manhattan'], ['Served on ice', 'Served up', 'Served tall'], [22, 28], [0, 0], ['Bittersweet, strong and stirred.', 'Bright, citrusy and shaken.', 'Long, light and refreshing.'], 10],
      ['zero', ['Zero Spritz', 'Zero Sour', 'Garden Tonic', 'Ginger Highball', 'Sparkling Tea'], ['Served tall', 'Served on ice'], [12, 16], [0, 0], ['Alcohol-free, dry and refreshing.', 'Alcohol-free, with citrus and herbs.'], 10]
    ];
    var total = T.reduce(function (a, t) { return a + t[6]; }, 0), L = ['category,producer,name,vintage,region,glass,bottle,description,grape'], seen = {};
    T.forEach(function (t) {
      var want = Math.round(t[6] * n / total), made = 0, tries = 0;
      while (made < want && tries++ < want * 30) {
        var mix = t[0] === 'cocktail' || t[0] === 'zero', house = mix ? 'House' : pick(houses), style = pick(t[1]);
        var wineish = ['red', 'white', 'sparkling', 'rose'].indexOf(t[0]) >= 0, vint = wineish ? String(2015 + Math.floor(rnd() * 10)) : '';
        var name = mix ? pick(['Smoked ', 'Garden ', 'Coastal ', 'Late ', 'Golden ', 'Midnight ', 'Rosella ', 'Yuzu ', 'Wattleseed ', 'Finger Lime ']) + style + ' No. ' + (1 + Math.floor(rnd() * 40)) : style;
        var key = house + '|' + name + '|' + vint; if (seen[key]) continue; seen[key] = 1;
        var gl = t[3][0] + Math.floor(rnd() * (t[3][1] - t[3][0] + 1)), bt = t[4][1] ? t[4][0] + Math.floor(rnd() * (t[4][1] - t[4][0] + 1)) : '';
        L.push([t[0], q(house), q(name), vint, q(pick(t[2])), gl, bt, q(pick(t[5])), wineish && style.indexOf('Brut') < 0 && style.indexOf('Blanc') < 0 ? q(style.replace(' Rosé', '')) : ''].join(',')); made++;
      }
    });
    return L.slice(0, n + 1).join('\n');
  };
})();
