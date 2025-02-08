using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace localadmin.Models
{
    public class QuizCard
    {
        public int ID { get; set; }
        public int QuizID { get; set; }
        public string Question { get; set; }
        public List<string> Answers { get; set; }
        //picture
        public int CorrectAnswerIndex { get; set; }

        public QuizCard() { 
        }
    }
}
