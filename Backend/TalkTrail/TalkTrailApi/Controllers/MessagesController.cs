using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalkTrail.Api.Data;
using TalkTrail.Api.DTOs.Message;
using TalkTrail.Api.Model;

namespace TalkTrail.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public MessagesController(AppDbContext context)
        {
            _context = context;
        }
        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue("userId"));
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Message) || request.ReceiverId <= 0)
                    return BadRequest(new { message = "Receiver ID and message are required." });

                var senderId = GetUserId();

                var message = new Message
                {
                    SenderId = senderId,
                    ReceiverId = request.ReceiverId,
                    Content = request.Message,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Message sent successfully",
                    data = new MessageResponse
                    {
                        Id = message.Id,
                        SenderId = message.SenderId,
                        ReceiverId = message.ReceiverId,
                        Message = message.Content,
                        CreatedAt = message.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("conversation/{userId}")]
        public async Task<IActionResult> GetConversation(int userId)
        {
            try
            {
                var currentUserId = GetUserId();

                var chatHistory = await _context.Messages
                    .Include(m => m.Sender)
                    .Include(m => m.Receiver)
                    .Where(m =>
                        (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                        (m.SenderId == userId && m.ReceiverId == currentUserId))
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new
                    {
                        m.Id,
                        m.SenderId,
                        SenderName = m.Sender.Username,
                        m.ReceiverId,
                        ReceiverName = m.Receiver.Username,
                        m.Content,
                        SentDate = m.CreatedAt.ToString("yyyy-MM-dd"),
                        SentTime = m.CreatedAt.ToString("hh:mm tt")
                    })
                    .ToListAsync();

                return Ok(chatHistory);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            try
            {
                var currentUserId = GetUserId();
                var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == id);

                if (message == null)
                    return NotFound(new { message = "Message not found" });

                if (message.SenderId != currentUserId)
                    return Forbid("You can only delete your own messages.");

                _context.Messages.Remove(message);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Message deleted successfully", id });
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
