using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace localadmin.Models
{
    public class Roles
    {
        public int ID { get; set; }

        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsSystemRole { get; set; }

        public static readonly List<Roles> AllRoles = new List<Roles>
        {
            new Roles { ID = 1, Name = "default", Description = "Has full access to the system.", IsSystemRole = true},
            new Roles { ID = 2, Name = "admin", Description = "Can manage users and content.", IsSystemRole = false},
           
        };
    }
}
