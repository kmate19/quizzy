using System.Windows;
using System.Windows.Controls;
using System.ComponentModel;
using localadmin.ViewModels;
using System.Diagnostics;
using localadmin.Services;
using localadmin.Views;
using System.Formats.Asn1;
using System.Windows.Media;
using System.Windows.Threading;

namespace localadmin;

public partial class MainWindow : Window, INotifyPropertyChanged
{
    public NavigationService NavigationService { get; } = new NavigationService();
    public SharedStateService SharedState { get; } = SharedStateService.Instance;
    public UserViewModel UserViewModel { get; private set; }
    public ReviewViewModel ReviewViewModel { get; private set; }
    public QuizViewModel QuizViewModel { get; private set; }

    private object _currentView = null!;

    public object CurrentView
    {
        get => _currentView;
        set
        {
            _currentView = value;
            OnPropertyChanged(nameof(CurrentView));
        }
    }

    private bool _isLoading;
    public bool IsLoading
    {
        get => _isLoading;
        set
        {
            if (_isLoading != value)
            {
                _isLoading = value;
                OnPropertyChanged(nameof(IsLoading));
            }
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged(string propertyName)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    public MainWindow()
    {
        InitializeComponent();
        Hide();

        Loaded += MainWindow_Loaded;

        NavigationService.ViewModelChanged += OnViewModelChanged;

        DataContext = this;
    }

    private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        UserViewModel = new UserViewModel(NavigationService, SharedState);
        ReviewViewModel = new ReviewViewModel(NavigationService, SharedState);
        QuizViewModel = new QuizViewModel(NavigationService, SharedState);

        await UserViewModel.InitializeAsync();
        await QuizViewModel.InitializeAsync();

        OnViewModelChanged(QuizViewModel);
        OnPropertyChanged(nameof(CurrentView));

        Loaded -= MainWindow_Loaded;
    }

    private void OnViewModelChanged(object newViewModel)
    {
        CurrentView = newViewModel;
    }

    private void RedirectToMainPage(object sender, RoutedEventArgs e)
    {
        string url = "http://localhost:5173";
        Process.Start(new ProcessStartInfo("cmd", $"/c start {url}")
        { CreateNoWindow = true });
    }

    private void Searchbar_gotFocus(object sender, RoutedEventArgs e)
    {
        if (sender is TextBox textBox && textBox.Text == "Keresés")
        {
            SharedState.SearchText = "";
        }
    }

    private void Searchbar_textChanged(object sender, TextChangedEventArgs e)
    {
        if (sender is not TextBox textBox) return;

        switch (CurrentView)
        {
            case UserViewModel userViewModel:
                userViewModel.SearchUsers(SharedState.SearchText);
                break;
            case ReviewViewModel reviewViewModel:
                reviewViewModel.SearchReviews(SharedState.SearchText);
                break;
            case QuizViewModel quizViewModel:
                quizViewModel.SearchQuizes(SharedState.SearchText);
                break;
        }
    }

    private void UsersButton_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(UserViewModel);
        SharedState.SearchText = "Keresés";
    }

    private void Quizbutton_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(QuizViewModel);
        SharedState.SearchText = "Keresés";
    }

    private void ReviewsButtons_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(ReviewViewModel);
        SharedState.SearchText = "Keresés";
    }

    protected override void OnClosed(EventArgs e)
    {
        base.OnClosed(e);
        Application.Current.Shutdown();
    }
}

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        MainWindow mainWindow = new MainWindow();
        mainWindow.Hide();

        APIKeyWindow apiKeyWindow = new APIKeyWindow(mainWindow);
        apiKeyWindow.Show();
    }
}