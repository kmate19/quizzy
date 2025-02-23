using System.Windows;
using System.Windows.Controls;
using System.ComponentModel;
using localadmin.ViewModels;
using System.Diagnostics;
using localadmin.Services;
using localadmin.Views;

namespace localadmin;

public partial class MainWindow : Window, INotifyPropertyChanged
{
    public NavigationService NavigationService { get; } = new NavigationService();
    public SharedStateService SharedState { get; } = SharedStateService.Instance;
    public UserViewModel UserViewModel { get; }
    public ReviewViewModel ReviewViewModel { get; }
    public QuizViewModel QuizViewModel { get; }

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

    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged(string propertyName)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    public MainWindow()
    {
        InitializeComponent();
        //Hide();

        UserViewModel = new UserViewModel(NavigationService, SharedState);
        ReviewViewModel = new ReviewViewModel(NavigationService, SharedState);
        QuizViewModel = new QuizViewModel(NavigationService, SharedState);

        NavigationService.ViewModelChanged += OnViewModelChanged;

        CurrentView = UserViewModel;

        DataContext = this;
    }

    private void OnViewModelChanged(object newViewModel)
    {
        CurrentView = newViewModel;
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

    private void RedirectToMainPage(object sender, RoutedEventArgs e)
    {
        string url = "https://www.google.com";
        Process.Start(new ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
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
        QuizViewModel.SearchQuizes(SharedState.SearchText);
        SharedState.SearchText = "Keresés";
    }

    private void Quizbutton_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(QuizViewModel);
        QuizViewModel.SearchQuizes(SharedState.SearchText);
        SharedState.SearchText = "Keresés";
    }

    private void ReviewsButtons_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(ReviewViewModel);
        QuizViewModel.SearchQuizes(SharedState.SearchText);
        SharedState.SearchText = "Keresés";
    }

    protected override void OnClosed(EventArgs e)
    {
        base.OnClosed(e);
        Application.Current.Shutdown();
    }
}
/*
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
}*/