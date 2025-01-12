using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.ComponentModel;
using FuzzySharp;


namespace localadmin;

public partial class MainWindow : Window
{
    UserViewModel viewModel=new UserViewModel();
    public MainWindow()
    {
        InitializeComponent();
        DataContext = viewModel;
        viewModel.ApplyFilter("");
    }

    private void RedirectToMainPage(object sender, RoutedEventArgs e)
    {
        string url = "https://www.google.com";
        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
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
            viewModel.ApplyFilter(textBox.Text);
        }
    }

    private void Searchbar_textChanged(object sender, TextChangedEventArgs e)
    {
        var textBox = sender as TextBox;
        viewModel.ApplyFilter(textBox.Text);
    }
}
