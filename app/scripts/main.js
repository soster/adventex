


    var term = $('#terminal').terminal(function(command) {
        this.echo(Interpreter.interpret(command));
    }, {
        greetings: MESSAGE.console.greetings,
        name: MESSAGE.name,
        prompt: CONFIG.console.prompt,
        height: CONFIG.console.height
    });
