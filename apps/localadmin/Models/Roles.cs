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
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public static readonly List<Roles> AllRoles = new List<Roles>
        {
            new Roles { ID = 1, Name = "Admin", Description = "Has full access to the system.", IsSystemRole = true, CreatedAt = DateTime.Now.AddMonths(-12), UpdatedAt = DateTime.Now },
            new Roles { ID = 2, Name = "Moderator", Description = "Can manage users and content.", IsSystemRole = false, CreatedAt = DateTime.Now.AddMonths(-10), UpdatedAt = DateTime.Now.AddDays(-5) },
            new Roles { ID = 3, Name = "User", Description = "Regular user with basic privileges.", IsSystemRole = false, CreatedAt = DateTime.Now.AddMonths(-8), UpdatedAt = DateTime.Now.AddDays(-2) },
            new Roles { ID = 4, Name = "Guest", Description = "Limited access to view content.", IsSystemRole = false, CreatedAt = DateTime.Now.AddMonths(-6), UpdatedAt = DateTime.Now.AddDays(-10) },
            new Roles { ID = 5, Name = "Support", Description = "Can respond to user queries.", IsSystemRole = false, CreatedAt = DateTime.Now.AddMonths(-3), UpdatedAt = DateTime.Now.AddDays(-1) },
            new Roles { ID = 6, Name = "Developer", Description = "Has access to development tools.", IsSystemRole = true, CreatedAt = DateTime.Now.AddMonths(-15), UpdatedAt = DateTime.Now.AddDays(-20) }
        };
    }
}
