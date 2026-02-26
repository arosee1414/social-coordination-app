using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Services;

namespace SocialCoordinationApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : BaseApiController
    {
        private readonly INotificationsService _notificationsService;

        public NotificationsController(INotificationsService notificationsService)
        {
            _notificationsService = notificationsService;
        }

        /// <summary>
        /// Get paginated notifications for the current user
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedNotificationsResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetNotifications(
            [FromQuery] int limit = 20,
            [FromQuery] string? continuationToken = null)
        {
            var userId = GetUserId();
            var result = await _notificationsService.GetNotificationsAsync(userId, limit, continuationToken);
            return Ok(result);
        }

        /// <summary>
        /// Get unread notification count for the current user
        /// </summary>
        [HttpGet("unread-count")]
        [ProducesResponseType(typeof(UnreadCountResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetUserId();
            var result = await _notificationsService.GetUnreadCountAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Mark a specific notification as read
        /// </summary>
        [HttpPut("{notificationId}/read")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MarkAsRead(string notificationId)
        {
            var userId = GetUserId();
            try
            {
                await _notificationsService.MarkAsReadAsync(userId, notificationId);
                return NoContent();
            }
            catch (Microsoft.Azure.Cosmos.CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return NotFound();
            }
        }

        /// <summary>
        /// Mark all notifications as read for the current user
        /// </summary>
        [HttpPut("read-all")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetUserId();
            await _notificationsService.MarkAllAsReadAsync(userId);
            return NoContent();
        }

        /// <summary>
        /// Delete a specific notification
        /// </summary>
        [HttpDelete("{notificationId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteNotification(string notificationId)
        {
            var userId = GetUserId();
            try
            {
                await _notificationsService.DeleteNotificationAsync(userId, notificationId);
                return NoContent();
            }
            catch (Microsoft.Azure.Cosmos.CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return NotFound();
            }
        }
    }
}