using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace localadmin.Models
{
    public class QuizCard
    {
        public enum EQuitType
        {
            normal,
            twochoise
        }

        public int ID { get; set; }
        public int QuizID { get; set; }
        public EQuitType Type { get; set; }
        public string Question { get; set; }
        public List<string> Answers { get; set; }
        //picture
        public int CorrectAnswerIndex { get; set; }

        public QuizCard() { 
        }
    }
}
