using System.Globalization;
using System.Windows.Data;

namespace localadmin.Services
{
    public class InvertBooleanConverter : IValueConverter
    {
        /// <summary>
        /// ez az osztály a felhasználók státuszához szükséges, hogy a felhasználók státuszát ne tudd levenni ha már egyszer ráraktad. Ez vonatkozik a default és az admin jogosultságokra is.
        /// </summary>
        /// <param name="value"></param>
        /// <param name="targetType"></param>
        /// <param name="parameter"></param>
        /// <param name="culture"></param>
        /// <returns></returns>
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool boolValue)
                return !boolValue;
            return true;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

}
