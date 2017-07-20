Service modules interface with devices that communicate using the HTTP(S) protocol. Currently HTTP versions 1.0 and 1.1 are supported.

They are similar to [Device Drivers](driver-development/device-drivers.md) with two major differences:

1. It's not recommended to use the common `received` function
2. They do not have a `send` function

This is because HTTP is much more contextual than many protocols. It'll often only return success whereas many custom device protocol responses can be interpreted without knowledge of the original request.

## Sending a Request

Each request should either set the `on_receive` callback option or provide a block for response processing.

| Method | Arguments | Description |
| :--- | :--- | :--- |
| request | verb, path, options = {}, &blk | allows you to pass in a custom verb |
| get | path, options = {}, &blk | |
| post | path, options = {}, &blk |  |
| put | path, options = {}, &blk |  |
| delete | path, options = {}, &blk |  |

```ruby
# Example usage:

def query_position
    # Get request will look like:
    # http://domain.or.ip/api/status_of?coordinates=detailed
    get('/api/status_of', {
        query: {
            coordinates: :detailed
        }
    }) do |data, resolve, command|
        check_response(data) do |resp|
            # Update status (made available to interfaces)
            self[:position] = resp['coords']
        end
    end
end

def check_response(data)
    # Check response status
    # (might have been 500 or 404, depends on what you are expecting)
    if data.status == 200
        begin
            # We're assuming a JSON response and we are passing that data
            # back to the calling function and assuming success at this point
            yield ::JSON.parse(data.body) if block_given?
            return :success
        rescue => e
            logger.print_error e
        end 
    end

    # Fail if there are any issues
    # Obviously this behaviour depends on the service etc
    :abort
end

```

### Request Options

| Option | Verbs | Example | Effect |
| :--- | :--- | :--- | :--- |
| `query` | All | `query: "me=bob&other=rain"` === `query: {me: :bob, other: :rain}` | URI**?me=bob&other=rain** |
| `body` | Put, Post | `body: "data=hello&other=world"` === `body: {data: :hello, other: :world}` | when body is a string it will be sent as is. When a hash, it will be form encoded. |
| `headers` | All | `headers: {Name: 'value'}` | Some headers are transformed further. See bellow |
| `file` | Put, Post | `file: 'path/to/file.ext'` | Will send the file as the body |
| `keepalive` | All | `keepalive: false` | Will close the connection once the request has completed |
| `ntlm` | All | `ntlm: {user: 'u', password: 'p', domain: 'd'}` | Will perform a request with an endpoint that requires NTLM auth |
| `digest` | All | `digest: {user: 'u', password: 'p', domain: 'd'}` | Will perform a request with an endpoint that requires digest auth |

NOTE:: Both NTLM and Digest auth are challenge response protocols and won't work with HTTP 1.0 or keep alive false

### Basic Authentication

Basic auth is supported natively along with NTLM and digest authentication techniques.
All that is required is to set the `authorization` header like so:

```ruby
options = {
    headers: {
        authorization: [username, password]
    }
}
```

For more advanced methods of authentication see [[Utilities and Helpers]]


## Handling a Response

The response object is passed to your received block and looks like this:

```ruby

get '/' do |data|
    # Response body as a string
    data.body

    # HTTP version the server is using (a string)
    data.http_version

    # The status code returned as an integer
    data.status

    # Was the connection kept alive for possible further requests
    data.keep_alive

    # What cookies have been stored at this path (as a Hash)
    data.cookies
    data.cookies['user_id']

    # The data object itself is a hash of all the headers
    data['Content-Type'] # => 'text/html'
end

```



## Cookies

Cookies are handled in the background in the same way a browser would handle cookies.

There is a helper method that can be used to clear cookies: `clear_cookies`

You can set cookies by setting the `cookie` header field. Supports both strings and hashes.
