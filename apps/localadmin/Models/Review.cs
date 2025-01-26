using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace localadmin.Models
{
    public class Review
    {
        public string MadeBy { get; set; }
        public string ReviewText { get; set; }
        //public string MadeOn {  get; set; }
        public int Rating { get; set; }
        public string Stars => new string('★', Rating) + new string('☆', 5 - Rating);

        public Review()
        { 
        }
    }
}
