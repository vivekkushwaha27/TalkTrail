using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalkTrail.Api.Data;
using TalkTrail.Api.DTOs.Group;
using TalkTrail.Api.DTOs.Message;
using TalkTrail.Api.Model;
using TalkTrail.Api.Models;
using TalkTrailApi.DTOs.Group;

namespace TalkTrail.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GroupsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public GroupsController(AppDbContext context)
        {
            _context = context;
        }
        private int GetUserId() => int.Parse(User.FindFirstValue("userId"));

        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { message = "Group name is required" });

            var currentUserId = GetUserId();

            var group = new Group
            {
                Name = request.Name,
                CreatedBy = currentUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            // Add the creator as a member
            _context.GroupMembers.Add(new GroupMember
            {
                GroupId = group.Id,
                UserId = currentUserId
            });

            // Add other members
            if (request.Members != null)
            {
                foreach (var memberId in request.Members.Distinct())
                {
                    if (memberId != currentUserId)
                    {
                        _context.GroupMembers.Add(new GroupMember
                        {
                            GroupId = group.Id,
                            UserId = memberId
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Group created successfully",
                data = new GroupResponse
                {
                    Id = group.Id,
                    Name = group.Name,
                    CreatedBy = currentUserId,
                    CreatedAt = group.CreatedAt
                }
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetGroups()
        {
            var currentUserId = GetUserId();

            var groups = await _context.GroupMembers
                .Include(gm => gm.Group)
                .Where(gm => gm.UserId == currentUserId)
                .Select(gm => new GroupResponse
                {
                    Id = gm.Group.Id,
                    Name = gm.Group.Name,
                    CreatedBy = gm.Group.CreatedBy,
                    CreatedAt = gm.Group.CreatedAt
                })
                .ToListAsync();

            return Ok(groups);
        }

        [HttpPost("{groupId}/add-members")]
        public async Task<IActionResult> AddMembers(int groupId, [FromBody] AddMembersRequest request)
        {
            var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == groupId);
            if (group == null)
                return NotFound(new { message = "Group not found" });

            foreach (var memberId in request.Members.Distinct())
            {
                var exists = await _context.GroupMembers
                    .AnyAsync(gm => gm.GroupId == groupId && gm.UserId == memberId);

                if (!exists)
                {
                    _context.GroupMembers.Add(new GroupMember
                    {
                        GroupId = groupId,
                        UserId = memberId
                    });
                }
            }

            await _context.SaveChangesAsync();

            var updatedMembers = await _context.GroupMembers
                .Include(gm => gm.User)
                .Where(gm => gm.GroupId == groupId)
                .Select(gm => new
                {
                    gm.User.Id,
                    gm.User.Username
                })
                .ToListAsync();

            return Ok(new { message = "Members added successfully", members = updatedMembers });
        }

        [HttpPost("{groupId}/messages")]
        public async Task<IActionResult> SendGroupMessage(int groupId, [FromBody] SendGroupMessageRequest request)
        {
            var currentUserId = GetUserId();

            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { message = "Message content is required." });

            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == groupId && gm.UserId == currentUserId);

            if (!isMember)
                return Forbid("You are not a member of this group.");

            var groupMessage = new GroupMessage
            {
                GroupId = groupId,
                SenderId = currentUserId,
                Message = request.Message,
                CreatedAt = DateTime.UtcNow
            };

            _context.GroupMessages.Add(groupMessage);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Group message sent successfully",
                data = new GroupMessageResponse
                {
                    Id = groupMessage.Id,
                    GroupId = groupMessage.GroupId,
                    SenderId = groupMessage.SenderId,
                    Message = groupMessage.Message,
                    CreatedAt = groupMessage.CreatedAt
                }
            });
        }

        [HttpGet("{groupId}/messages")]
        public async Task<IActionResult> GetGroupMessages(int groupId)
        {
            var currentUserId = GetUserId();

            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == groupId && gm.UserId == currentUserId);

            if (!isMember)
                return Forbid("You are not a member of this group.");

            var messages = await _context.GroupMessages
                .Include(gm => gm.Sender)
                .Where(gm => gm.GroupId == groupId)
                .OrderBy(gm => gm.CreatedAt)
                .Select(gm => new
                {
                    gm.Id,
                    gm.SenderId,
                    SenderName = gm.Sender.Username,
                    gm.Message,
                    SentDate = gm.CreatedAt.ToString("yyyy-MM-dd"),
                    SentTime = gm.CreatedAt.ToString("hh:mm tt")
                })
                .ToListAsync();

            return Ok(messages);
        }

        [HttpDelete("{groupId}/messages/{messageId}")]
        public async Task<IActionResult> DeleteGroupMessage(int groupId, int messageId)
        {
            var currentUserId = GetUserId();

            var message = await _context.GroupMessages
                .FirstOrDefaultAsync(gm => gm.Id == messageId && gm.GroupId == groupId);

            if (message == null)
                return NotFound(new { message = "Message not found" });

            if (message.SenderId != currentUserId)
                return Forbid("You can only delete your own messages.");

            _context.GroupMessages.Remove(message);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Group message deleted successfully", id = messageId });
        }
    }
}
