using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace localadmin.Models
{
    public class Roles
    {
        /// <summary>
        /// Ez az osztály reprezentálja az összes szerepkört az alkalmazásban.
        /// </summary>
        public int ID { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsSystemRole { get; set; }

        public static readonly List<Roles> AllRoles = new List<Roles>
        {
            new Roles { ID = 1, Name = "default", Description = "Az alap felhasználói jogosultság.", IsSystemRole = true},
            new Roles { ID = 2, Name = "admin", Description = "Mindent IS tud mokolni", IsSystemRole = false},   
        };
    }
}
