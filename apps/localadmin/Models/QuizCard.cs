using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace localadmin.Models
{
    public class QuizCard
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public enum EQuizType
        {
            normal,
            twochoise
        }
        
        //todo: kep, es azt a szar geci typeot valahogy atconvertelni, meg nincs detailed viewba username

        public int ID { get; set; }
        public int QuizID { get; set; }
        //[JsonPropertyName("type")]
        //public EQuizType Type { get; set; }
        public string Question { get; set; }
        public List<string> Answers { get; set; }
        public int CorrectAnswerIndex { get; set; }

        public QuizCard() { }   
    }
}
