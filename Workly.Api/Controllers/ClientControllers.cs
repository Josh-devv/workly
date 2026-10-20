
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workly.Api.Dtos.Client;
using Workly.Api.Models;
using Workly.Api.Services.Client;

namespace Workly.Api.Controllers
{

    //this endpoint is no longer allowing anonyous requests
    //this tells ASP.NET Core that the caller must be autheticated before accessing the controller endpoint
    //Authoriza tells ASP.NET Core that requetss to this controller must come from a authenticated user
    //meaning that the GET,POST,PUT,DELETE endpoints will require authentication

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ClientController(
        IClientService clientService,
        ILogger<ClientController> logger
    ) : ControllerBase
    {
        // GET: api/client
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientResDto>>> GetClients(
            CancellationToken cancellationToken)
        {
            if (!TryGetAuthenticatedUserId(out var userId))
                return Unauthorized();

            try
            {
                var clients = await clientService.GetClientsAsync(userId, cancellationToken);
                return Ok(clients.Select(ToDto));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve clients for user {UserId}", userId);

                return StatusCode(500, new
                {
                    message = "An error occurred while retrieving clients."
                });
            }
        }

        // GET: api/client/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ClientResDto>> GetClientById(
            Guid id,
            CancellationToken cancellationToken)
        {
            if (!TryGetAuthenticatedUserId(out var userId))
                return Unauthorized();

            try
            {
                var client = await clientService.GetClientByIdAsync(
                    id,
                    userId,
                    cancellationToken);

                if (client is null)
                    return NotFound(new { message = "Client not found." });

                return Ok(ToDto(client));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve client {ClientId}", id);

                return StatusCode(500, new
                {
                    message = "An error occurred while retrieving the client."
                });
            }
        }

        // POST: api/client
        [HttpPost]
        public async Task<ActionResult<ClientResDto>> CreateClient(
            CreateClientDto newClient,
            CancellationToken cancellationToken)
        {
            if (!TryGetAuthenticatedUserId(out var userId))
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(newClient.Name) ||
                string.IsNullOrWhiteSpace(newClient.Company))
            {
                return BadRequest(new
                {
                    message = "Client name and company name are required."
                });
            }

            try
            {
                var client = await clientService.CreateClientAsync(
                    newClient,
                    userId,
                    cancellationToken);

                if (client is null)
                    return Forbid();

                return CreatedAtAction(
                    nameof(GetClientById),
                    new { id = client.Id },
                    ToDto(client));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create client for user {UserId}", userId);

                return StatusCode(500, new
                {
                    message = "An error occurred while creating the client."
                });
            }
        }

        // PUT: api/client/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<ClientResDto>> UpdateClient(
            Guid id,
            UpdateClientDto updateClient,
            CancellationToken cancellationToken)
        {
            if (!TryGetAuthenticatedUserId(out var userId))
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(updateClient.Name) ||
                string.IsNullOrWhiteSpace(updateClient.Company))
            {
                return BadRequest(new
                {
                    message = "Client name and company name are required."
                });
            }

            try
            {
                var client = await clientService.UpdateClientAsync(
                    id,
                    updateClient,
                    userId,
                    cancellationToken);

                if (client is null)
                    return NotFound(new { message = "Client not found." });

                return Ok(ToDto(client));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update client {ClientId}", id);

                return StatusCode(500, new
                {
                    message = "An error occurred while updating the client."
                });
            }
        }

        // DELETE: api/client/{id}
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult> DeleteClient(
            Guid id,
            CancellationToken cancellationToken)
        {
            if (!TryGetAuthenticatedUserId(out var userId))
                return Unauthorized();

            try
            {
                var deleted = await clientService.DeleteClientAsync(
                    id,
                    userId,
                    cancellationToken);

                if (!deleted)
                    return NotFound(new { message = "Client not found." });

                return Ok(new { message = "Client deleted successfully." });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete client {ClientId}", id);

                return StatusCode(500, new
                {
                    message = "An error occurred while deleting the client."
                });
            }
        }


        //the better response
        private static ClientResDto ToDto(Clients client) =>
            new(
                client.Id,
                client.Name,
                client.Company,
                client.Email,
                client.Phone,
                client.Address,
                client.Notes,
                client.OrganizationId,
                client.Created_At
            );

        //this reads the sub claim from the validated supabase token and converts it into C#
        //This checks both the mapped claim name and the original JWT claim name.
        //User identification works: You can extract the authenticated user's UUID using ClaimTypes.NameIdentifier.
        //THis helper was used in identifying the current User
        private bool TryGetAuthenticatedUserId(out Guid userId)
        {
            var userIdClaim =
                User.FindFirstValue(ClaimTypes.NameIdentifier)//try this mapped claim first; if it isnt available try sub
                ?? User.FindFirstValue("sub");//supabase JWT contains the user's UUID in this sub claim

            return Guid.TryParse(userIdClaim, out userId);
        }
    }
}




//A Claim is a piece of information about that user. such as their ID, email, or role. The supabase JWT contaisn the user's UUID in the sub claim
//User: ASP.NET Core makes the authenticated caller identity available through User....This is a claimsPrincipal representing the current user


//One important detail: because your API connects to Supabase PostgreSQL using a privileged database account, don't assume Supabase RLS will automatically protect these API queries. Your API needs to enforce the access checks itself.

//Any(): this answerws a yes or no question: does at least one macthing record exists