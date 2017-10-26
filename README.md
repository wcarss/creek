# Creek

A smallish javascript simulation/game engine.

 * vanilla js (at least for now)
 * not worth using in your own project yet
 * mostly just an exercise in an organizational style
 * one aim is to allow a json "spec" to be loaded from a URL to define a game

### How to Read the Code

This project uses a made-up pattern I'm trying out that we'll call the Manager Pattern. It's pretty similar to the well-known Module javascript pattern, but it's doing some particular things.

You can read the code by starting at the bottom, where the GameManager is defined, and looking into its init() method, which instantiates all of the other managers and passes to each of them the managers that are necessary for their operation. From there, you can dive into any individual manager by reviewing its own init() method to see what it sets up and exports. Most of the heart of the program is accessible in the RenderManager's nextFrame method, which issues calls to its own draw() method for everything EntityManager returns from get_draw_list(), and also to the EntityManager's update() method.

Here's a contrived example of the Manager pattern to briefly look at:

``` javascript
let ThingManager = (function () {
  let internal_var = null,
    other_var = null,
    internal_debug_method = function () {
      console.log("internal var state is " + internal_var);
    },
    update_internal_var = function (arg) {
      internal_debug_method();
      other_var = internal_var;
      internal_var = arg;
      internal_debug_method();
    },
    get_other_var = function () {
      return other_var;
    },
    get_internal_var = function () {
      return internal_var;
    },
    init = function (_internal_var, _other_var) {
      internal_var = _internal_var;
      other_var = _other_var;
    };

    return function (_internal_var, _other_var) {
      init(_internal_var, _other_var);

      return {
        update: update_internal_var,
        get_other_var: get_other_var,
        get_internal_var: get_internal_var,
      };
    };
})();

thing_manager = ThingManager("one", "two");
thing_manager.get_internal_var();
// => "one"
thing_manager.get_other_var();
// => "two"
thing_manager.update("test");
//internal var state is one
//internal var state is test
thing_manager.get_internal_var();
// => "test"
thing_manager.get_other_var();
// => "one"
```

Things to note: renameable public/private methods and internal are achieved as with the module pattern and the 'init' function acts as a constructor to operate on initial values. The result of the definition is a callable method that returns an instance of the manager object with its own internal state.

### Rambling Thoughts and Justifications

So I can hear you asking: what's the value in this?

The basic idea is that, from an initially defined state, different areas of code often take pieces of models and modify them, and other pieces of code need access to the most up-to-date version of the model. Passing around objects themselves from within closures can lead to confusing behaviour where two pieces of code might have different copies of an object -- this encapsulation is mostly a way to avoid that. You can think of these Managers as something like a Model or a Registry class, for controlling global access to important resources.

What each broad piece of the code gets in this program is a reference to the manager itself. These managers only get made once at the start of the program, and they can be asked to provide the interesting bits of data that they store authoritative copies of at any time. For example, if the window is resized and the context object is invalidated and replaced with a new context, the renderer that uses the context does not need to know or be told explicitly. It just asks for the context from the context manager when it needs to draw, and the context manager gives it the right thing.

Another example is with objects on the map. When an effect takes place in the engine, rather than merely hoping that the reference to the map object which this part of the code is working on is the same reference that all other pieces of the code are working on, we can ensure that is the case by relying on the map manager to furnish us with a reference. Each piece of the code gets a reference from the authoritative manager, and the manager was all that got passed around during program initialization, so everyone's manager is the same.

If you're sufficiently smart or your program is sufficiently simple, you probably don't need assurances of these things -- you can likely keep track of it in your head and ensure that you've never accidentally split instances of state. I am not that smart, and in at least one existing project have run into problems. It's probable that existing js web frameworks or libraries solve or mitigate this problem, perhaps in different ways -- I just don't know about their solutions, and I'm learning about a way to solve it by coming up with my own theme park with blackjack, etc.

You can take a look at [wcarss.ca/creek](http://wcarss.ca/creek).

### Authorship and License

Written by Wyatt Carss in 2017, whom you can read more about/by at [wcarss.ca](http://wcarss.ca). or spam freely at [carss.w@gmail.com](mailto:carss.w@gmail.com).

This project and its code, images, sounds, words, and any other resources are provided under the MIT License unless otherwise specified. See LICENSE.txt in the root of the project for the content of the License itself.
