using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace localadmin.Services
{
    public class NavigationService
    {
        public event Action<object> ViewModelChanged;

        public void NavigateTo(object viewModel)
        {
            ViewModelChanged?.Invoke(viewModel);
        }
    }
}
