using System.ComponentModel;

namespace localadmin.Services
{
    /// <summary>
    /// Ez az osztály felelős a keresési mező és az API kulcs megosztásáért. Ez az osztály minden felhasználó és quiz esetében ugyanazt az.
    /// </summary>
    public class SharedStateService : INotifyPropertyChanged
    {
        private static readonly SharedStateService _instance = new();
        public static SharedStateService Instance => _instance;

        private string _searchText = "Keresés";
        private string _apiKey = string.Empty;
        private string _apiURL = string.Empty;
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (_searchText != value)
                {
                    _searchText = value;
                    OnPropertyChanged(nameof(SearchText));
                }
            }
        }

        public string ApiKey
        {
            get => _apiKey;
            set
            {
                if (_apiKey != value)
                {
                    _apiKey = value;
                    OnPropertyChanged(nameof(ApiKey));
                }
            }
        }

        public string ApiURL
        {
            get => _apiURL;
            set
            {
                if (_apiURL != value)
                {
                    _apiURL = value;
                    OnPropertyChanged(nameof(ApiURL));
                }
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged(string propertyName) =>
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
