using System;
using System.Collections.Generic;
using FuzzySharp;

namespace localadmin.Services
{
    public static class SearchService
    {
        public static IEnumerable<T> FuzzySearch<T>(
            IEnumerable<T> items,
            string query,
            Func<T, IEnumerable<string>> propertiesToSearch,
            int threshold = 70)
        {
            if (string.IsNullOrWhiteSpace(query))
                return items;

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
