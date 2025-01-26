﻿using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using localadmin.ViewModels;
using System.Diagnostics;


namespace localadmin;

public partial class MainWindow : Window, INotifyPropertyChanged
{
    private object _currentView;
    public UserViewModel UserViewModel { get; } = new UserViewModel();
    public ReviewViewModel ReviewViewModel { get; } = new ReviewViewModel();
    public QuizViewModel QuizViewModel { get; } = new QuizViewModel();
    public MainWindow()
    {
        InitializeComponent();
        CurrentView = UserViewModel;
        DataContext = this;
    }

    public object CurrentView
    {
        get => _currentView;
        set
        {
            _currentView = value;
            OnPropertyChanged(nameof(CurrentView));
            Debug.WriteLine($"CurrentView changed to: {value?.GetType().Name}");
        }
    }

    public event PropertyChangedEventHandler PropertyChanged;

    protected void OnPropertyChanged(string propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    private void RedirectToMainPage(object sender, RoutedEventArgs e)
    {
        string url = "https://www.google.com";
        Process.Start(new ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
    }


    private void Searchbar_gotFocus(object sender, RoutedEventArgs e)
    {
        var textBox = sender as TextBox;
        if (textBox.Text == "Search")
        {
            textBox.Text = string.Empty;
        }
    }
    private void Searchbar_lostFocus(object sender, RoutedEventArgs e)
    {
        var textBox = sender as TextBox;
        if (textBox.Text == "")
        {
            textBox.Text = "Search";
            //CurrentView.ApplyFilter(textBox.Text);
        }
    }

    private void Searchbar_textChanged(object sender, TextChangedEventArgs e)
    {
        var textBox = sender as TextBox;

        if (CurrentView == UserViewModel)
        {
            UserViewModel.SearchUsers(textBox?.Text);
        }
        else if (CurrentView == ReviewViewModel)
        {
            ReviewViewModel.SearchReviews(textBox?.Text);
        }
        else if (CurrentView == QuizViewModel)
        {
            QuizViewModel.SearchQuizes(textBox?.Text);
        }
    }

    private void UsersButton_Click(object sender, RoutedEventArgs e)
    {
        CurrentView = UserViewModel;
    }

    private void Quizbutton_Click(object sender, RoutedEventArgs e)
    {
        CurrentView = QuizViewModel;
    }

    private void ReviewsButtons_Click(object sender, RoutedEventArgs e)
    {
        CurrentView = ReviewViewModel;
    }
}