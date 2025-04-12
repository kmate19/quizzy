using FuzzySharp;

namespace localadmin.Services
{
    /// <summary>
    /// Ez a funkció felelős a keresésért. Az items maga a kollekció, ez lehet felhasználó vagy quiz. 
    ///A query a keresési szöveg, a propertiesToSearch pedig azok a mezők amelyekben keresni szeretnénk. A threshold pedig a keresési pontosságot befolyásolja.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="items"></param>
    /// <param name="query"></param>
    /// <param name="propertiesToSearch"></param>
    /// <param name="threshold"></param>
    /// <returns></returns>

    public static class SearchService
    {
        public static IEnumerable<T> FuzzySearch<T>(
            IEnumerable<T> items,
            string query,
            Func<T, IEnumerable<string>> propertiesToSearch,
            int threshold = 70)
        {
            if (string.IsNullOrWhiteSpace(query) || query == "Keresés")
                return items;

            var exactMatches = items.Where(item =>
            {
                var properties = propertiesToSearch(item);
                return properties.Any(property =>
                    Fuzz.PartialRatio(property.ToLower(), query.ToLower()) == 100
                );
            }).ToList();

            if (exactMatches.Any())
                return exactMatches;

            return items.Where(item =>
            {
                var properties = propertiesToSearch(item);
                return properties.Any(property =>
                    Fuzz.PartialRatio(property.ToLower(), query.ToLower()) >= threshold
                );
            });
        }
    }
}