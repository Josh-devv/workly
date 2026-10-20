using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Workly.Api.Data;
using Workly.Api.Dtos.Organization;
using Workly.Api.Models;
using Workly.Api.Services.Organization;

namespace Workly.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrgController(IOrgService orgService, ILogger<OrgController> logger)
        : ControllerBase
    {
        //Get: api/organizations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrgResDto>>> GetOrganizations(
            CancellationToken cancellationToken
        )
        {
            if (!TryGetAutheticationUserId(out var userId))
            {
                return Unauthorized();
            }

            try
            {
                //EF doingssss
                var organizations = await orgService.GetOrgAsync(userId, cancellationToken);
                return Ok(organizations.Select(ToDto));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrive Organizations");
                return StatusCode(
                    500,
                    new { message = "An error occured while retrieving Organizations" }
                );
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<OrgResDto>> GetOrganizationById(
            Guid id,
            CancellationToken cancellationToken
        )
        {
            if (!TryGetAutheticationUserId(out var userId))
            {
                return Unauthorized();
            }

            var organization = await orgService.GetOrgByIdAsync(id, userId, cancellationToken);

            if (organization == null)
            {
                return NotFound(new { message = "Organization Not Found" });
            }

            return Ok(ToDto(organization));
        }

        //Post now works
        [HttpPost]
        public async Task<ActionResult<OrgResDto>> PostOrganization(
            CreateOrgDto newOrg,
            CancellationToken cancellationToken
        )
        {
            if (!TryGetAutheticationUserId(out var userId))
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(newOrg.Name))
            {
                return BadRequest(new { message = "Organization name is required." });
            }

            try
            {
                var organization = await orgService.CreateOrgAsync(
                    newOrg,
                    userId,
                    cancellationToken
                );
                if (organization is null)
                    return Forbid();

                return CreatedAtAction(
                    nameof(GetOrganizationById),
                    new { id = organization.Id },
                    ToDto(organization)
                );
            }
            catch (Exception ex)
            {
                //await transaction.RollbackAsync(cancellationToken);

                logger.LogError(ex, "Failed to create organization for user {UserId}.", userId);

                return StatusCode(
                    500,
                    new { message = "An error occurred while creating the organization." }
                );
            }
        }

        //PUT: api/client/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Organizations>> EditOrganization(
            Guid id,
            UpdateOrgDto updateOrg,
            CancellationToken cancellationToken
        )
        {
            if (!TryGetAutheticationUserId(out var userId))
            {
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(updateOrg.Name))
            {
                return BadRequest(new { message = "Organization name is required" });
            }

            var organization = await orgService.UpdateOrgAsync(
                id,
                userId,
                updateOrg,
                cancellationToken
            );

            if (organization == null)
            {
                return NotFound(new { message = "Organization Not Found" });
            }

            organization.Name = updateOrg.Name;
            try
            {
                return Ok(ToDto(organization));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update project {OrganizationId}.", id);
                return StatusCode(
                    500,
                    new { error = ex.Message, innerError = ex.InnerException?.Message }
                );
            }
        }

        //DELETE: api/client/{id}
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult> DeleteOrganization(
            Guid id,
            CancellationToken cancellationToken
        )
        {
            if (!TryGetAutheticationUserId(out var userId))
            {
                return Unauthorized();
            }

            var organization = await orgService.DeleteOrgAsync(id, userId, cancellationToken);

            if (organization == false)
            {
                return NotFound(new { message = "Organization Not Found" });
            }

            try
            {
                return Ok(new { message = "Organization deleted successfully." });
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new { message = "An error occurred while deleting the organization." }
                );
            }
        }

        private static OrgResDto ToDto(Organizations organization) =>
            new(organization.Name, organization.Created_At, organization.Created_By);

        private bool TryGetAutheticationUserId(out Guid UserId)
        {
            var UserClaim =
                User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            return Guid.TryParse(UserClaim, out UserId);
        }
    }
}
