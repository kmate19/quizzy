using System.Windows;
namespace localadmin.Views
{
    /// <summary>
    /// Ez az ablak jelenik meg, ha valmait meg kell erősíteni.
    /// </summary>
    public partial class PopUpModal : Window
    {
        public bool Result { get; private set; } = false;

        public PopUpModal(string message)
        {
            InitializeComponent();
            MessageText.Text = message;
        }

        private void Yes_Click(object sender, RoutedEventArgs e)
        {
            Result = true;
            DialogResult = true;
            Close();
        }

        private void No_Click(object sender, RoutedEventArgs e)
        {
            Result = false;
            DialogResult = false;
            Close();
        }
    }
}
