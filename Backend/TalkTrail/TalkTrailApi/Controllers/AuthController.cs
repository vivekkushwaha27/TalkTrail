using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TalkTrail.Api.Data;
using TalkTrail.Api.DTOs.Auth;
using TalkTrail.Api.Models;

namespace TalkTrail.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                request.Username = request.Username.ToLower().Trim();

                if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                    return BadRequest(new { message = "Username and password are required." });

                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
                if (existingUser != null)
                    return BadRequest(new { message = "Username already exists." });

                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var user = new User
                {
                    Username = request.Username,
                    PasswordHash = hashedPassword
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok("Registered successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
                if (user == null)
                    return BadRequest(new { message = "Invalid username or password." });

                bool isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                if (!isValidPassword)
                    return BadRequest(new { message = "Invalid username or password." });

                var token = GenerateJwtToken(user);

                return Ok(token);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromRoute] int Id)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var users = await _context.Users
                    .Where(u => u.Id == Id && u.Id != currentUserId)
                    .Select(u => new UserDto { Id = u.Id, Username = u.Username })
                    .ToListAsync();

                return Ok(users);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("get-users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var users = await _context.Users
                    .Where(u => u.Id != currentUserId)
                    .Select(u => new UserDto { Id = u.Id, Username = u.Username })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("get-all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new UserDto { Id = u.Id, Username = u.Username })
                    .ToListAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // JWT CREATION 
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("userId", user.Id.ToString()),
                new Claim("username", user.Username)                
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpireMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
