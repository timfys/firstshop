using main.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace main
{
    public class User
    {
        public UserModel GetUser() => _context.UserModel.FromSql($"select personId id, lastname from persons where personId=999").SingleOrDefault();
        private readonly myContext _context;

        public User(myContext context)
        {
            _context = context;
        }
    }
}