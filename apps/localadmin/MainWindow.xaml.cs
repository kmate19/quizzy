﻿using System.Windows;
using System.Windows.Controls;
using System.ComponentModel;
using localadmin.ViewModels;
using System.Diagnostics;
using localadmin.Services;
using localadmin.Views;
using System.Drawing;

namespace localadmin;

public partial class MainWindow : Window, INotifyPropertyChanged
{
    public NavigationService NavigationService { get; } = new NavigationService();
    public SharedStateService SharedState { get; } = SharedStateService.Instance;
    public UserViewModel UserViewModel { get; private set; }
    public ReviewViewModel ReviewViewModel { get; private set; }
    public QuizViewModel QuizViewModel { get; private set; }

    private string _CurrentAPI = string.Empty;

    public string CurrentAPI
    {
        get => _CurrentAPI;
        set
        {
            _CurrentAPI = value;
            OnPropertyChanged(nameof(CurrentAPI));
        }
    }

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

    /// <summary>
    /// Ez a funkció fut le, amikor az ablak betöltődik az api kulcs megadása után.
    /// </summary>
    private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        UserViewModel = new UserViewModel(NavigationService);
        ReviewViewModel = new ReviewViewModel(NavigationService);
        QuizViewModel = new QuizViewModel(NavigationService);

        await UserViewModel.InitializeAsync();
        await QuizViewModel.InitializeAsync();

        OnViewModelChanged(UserViewModel);
        OnPropertyChanged(nameof(CurrentView));

        Loaded -= MainWindow_Loaded;

        if(SharedState.ApiURL.Contains("localhost"))
            CurrentAPI = "Jelenleg hasznát api: http://localhost:3000";
        else
            CurrentAPI = "Jelenleg hasznát api: https://quizzy.kmate.xyz";
    }

    private void OnViewModelChanged(object newViewModel)
    {
        CurrentView = newViewModel;
    }

    private void RedirectToMainPage(object sender, RoutedEventArgs e)
    {
        string url = "";
        if(SharedState.ApiURL.Contains("localhost"))
            url= "http://localhost:3000";
        else
            url = "https://quizzy.kmate.xyz";
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

    /// <summary>
    /// Attól függően, hogy melyik viewmodelen vagyunk, meghívja a megfelelő keresési funkciót.
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
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
        if(QuizViewModel.Quizzes.Count == 0)
            MessageBox.Show("Nincsenek quiz-ek az adatbázisban.");
    }

    private void ReviewsButtons_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(ReviewViewModel);
        SharedState.SearchText = "Keresés";
        MessageBox.Show("Ez a funkció még nem elérhető.");
    }

    protected override void OnClosed(EventArgs e)
    {
        base.OnClosed(e);
        Application.Current.Shutdown();
    }
}

/// <summary>
/// Amikor elindul az alkalmazás, eltünik a főablak és megjelenik az API kulcs ablak.
/// </summary>

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        MainWindow mainWindow = new MainWindow();
        mainWindow.Hide();

        APIKeyWindow apiKeyWindow = new APIKeyWindow(mainWindow);

        APIChooser APIChooser = new APIChooser();
        bool? result=APIChooser.ShowDialog();

        if(result == true)
        {
            apiKeyWindow.Show();
        }
        else
        {
            Application.Current.Shutdown();
        }
    }
}