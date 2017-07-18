[Tokenisation](https://en.wikipedia.org/wiki/Lexical_analysis) is extremely important. When working with a stream of data, as provided by TCP and UDP, you most certainly want to

1. Wait for a complete response before processing
2. Want to process only one response at a time

Whilst this might seem to occur naturally most of the time, network contention, network errors and high data rates will eventually trip you up. CBus is one system where I've often see back to back messages returned in a single IO read.

Engine ships with two tokenisers to help you break up the incoming data. The default buffered tokeniser and the more advanced abstract tokeniser.

## Default Tokeniser

Usage:

```ruby
class Clipsal::CBus
    # Device driver helper
    tokenize delimiter: "\x0D"
end
```

Options:

| Option | Description |
| :---         |     :---     |
| delimiter | sequence to detect the end of message. Supports [strings and regexs](http://ruby-doc.org/core-2.2.0/String.html#method-i-split) |
| indicator | sequence to detect the start of a message |
| msg_length | can be used with an indicator if messages are always a fixed length |
| size_limit | prevents buffering from using all your memory if the end of a message is never detected |
| min_length | can help prevent false positives |
| encoding | defaults to ASCII-8BIT to avoid invalid characters when dealing with binary data |

Example:

`tokenize indicator: "\x02", delimiter: "\x03"`

and data: `"yu\x03\x02hello\x03\x02world\x03\x02how"`
Would have the following result:

* `yu\x03` would be discarded
* `hello` would be returned
* `world` would be returned
* `\x02how` would be buffered


## Abstract Tokeniser

The primary use case for this tokeniser is variable length messages, where length can be determined by the message contents. (commonly a length field in the header)

Usage:

```ruby
class Samsung::Displays::MdSeries
    tokenize indicator: "\xAA", callback: :check_length

    # Called by the Abstract Tokenizer
    def check_length(byte_str)
        # Check for minimum length
        return false if byte_str.bytesize <= 3
        response = str_to_array(byte_str)

        # data length byte + (header + checksum) == message length
        len = response[2] + 4

        if response.length >= len
            # return the length of this message (any excess will be buffered)
            return len
        else
            # false if the complete message hasn't arrived yet
            return false
        end
    end
end
```

Options:

| Option | Description |
| :---         |     :---     |
| callback | callable code, proc, lambda, method etc that will return an integer or false |
| indicator | sequence to detect the start of a message (string or regex) |
| size_limit | prevents buffering from using all your memory if the end of a message is never detected |
| encoding | defaults to ASCII-8BIT to avoid invalid characters when dealing with binary data |


## Further Reading

For a detailed overview of what these tokenisers are capable of, it is probably worth looking at their tests.

* [Buffered Tokeniser Spec](https://github.com/cotag/uv-rays/blob/master/spec/buffered_tokenizer_spec.rb)
* [Abstract Tokeniser Spec](https://github.com/cotag/uv-rays/blob/master/spec/abstract_tokenizer_spec.rb)
