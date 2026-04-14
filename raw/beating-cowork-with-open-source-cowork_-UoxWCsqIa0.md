---
tags: [eigent, camel-ai, multi-agent, open-source, cowork, mcp, agent-framework, agentic-ai]
source: https://www.youtube.com/watch?v=-UoxWCsqIa0
---

# Raw Transcript: Beating Cowork with Open Source Cowork

**Channel**: Sam Witteveen
**Upload Date**: 2026-01-21
**Duration**: 14:31

Okay, so last week Anthropic
released cowork and this was
quite a big deal at the time, for
a variety of different reasons.
And you can kind of think of this as being
like a mainstream version of Claude Code.
Now, at the time, a lot of people
kind of freaked out about this,
especially startups who were developing
products around the same sort of area.
One of the startups that was affected
Eigent.AI, they didn't freak out at all.
They actually took some
really radical choices.
and that's what this video is all about.
And having known that team for the last
couple of years, they reached out to me
late last week about sponsoring a video
to talk about just what they did and a bit
about their goals in why that they did it.
And I thought it was a great idea.
They're not trying to sell anything
to developers or anything like that.
it's more just a really interesting
startup story and a pivot in a product
around what they've actually been
building for the past year or so.
So this is the tweet
that kicked it all off.
so this is from Guohao And
he's the founder of Camel AI.
And if the name Camel AI sounds familiar.
it actually is because it's almost
three years ago that I actually
covered their first model.
They were one of the first people to
get into actually training up some
models for doing different kinds
of action taking way back in the
early days of the Llama one model.
so back then they were doing it as
an academic kind of thing, but they
eventually sort of pivoted and actually
started up a startup and the whole
goal with them from the start was
around building sort of agents and
making frameworks to build agents.
Camel AI AI has never really taken
off like an agent framework like
LangChain or like ADK, et cetera.
Their goal was to build a system that
would allow them to test different
ideas for multi-agent architectures.
and out of that came this
product called Eigent AI.
and this is basically a piece of
software that runs multi-agent systems.
Now going back to last Tuesday after
Anthropic announced Cowork, Guohao
realized that they weren't gonna be
able to market something that would
take on a big company like Anthropic.
So he made the very radical decision
to just decide, you know what?
We're gonna kill this product
and we're actually just gonna
open source the whole thing.
And you can see from this tweet here,
it really started to get some traction.
Now, at the time, I just thought it
was cool and I clicked like But that
tweet has gone on to have 1.7 million
views and a lot of interest from
a whole bunch of different places.
So very quickly Guohao realized that,
okay, if it's gonna open source it,
they need to give it a new name.
So he basically straightaway bought the
domain open-work.ai, and proceeded to
open source the whole thing that they'd
been building for quite a long time.
So there's some quite funny tweets here
actually sure enough, did open source it.
not only that gave it an Apache 2
license, and you can see here that
quite a number of people on Twitter or
X also found that was, quite amusing
about how the way he approached it.
and part of the reason for them doing
this Is that they realize that what
they've actually been building has been
a lesson in how to build multi-agent
architectures and how to customize
those multi-agent architectures so
that you can build agentic systems
that are hyper specialized And hyper
useful at being able to learn from data.
so in this video I wanna go through
the actual . Architecture About
what it is that they've built.
you can actually download the whole
thing for free and use it yourself and
use it with your own keys, et cetera.
But I think it's really interesting
to look at what they actually
built from a technical perspective.
if you're looking for lessons to
build your own multi-agent systems.
And  it's also really interesting
to see some of the reactions that
they got from people out of this.
So you can see here, they had
people from Xai reaching out to
talk about what they had done.
and this team has done a bunch
of good research over the years.
I think quite a number of people in
the community have been following
what they're doing and especially how
they've been looking at the whole sort
of area of incorporating models with
harnesses to make multi-agent systems.
Okay, so before there was Eigent AI, the
product, they actually started out making
an agent framework, and this is Camel AI.
So while this is not a framework,
I think that they're definitely
trying to push to a lot of people.
it's got some really interesting
things that I wanna point out here.
This was really built for people
to do research about agents and
test out different ideas in here.
So it's got a whole bunch of different
features, but really it's fundamentally
quite different than something like
LangChain AI or LlamaIndex, et cetera.
What they're interested in is building
things where you could scale things
up to have up to a million agents
going at the same time to be able to
see, do you get emergent behaviors?
What are the scaling laws around agents?
and in the process of doing that,
they've incorporated a bunch of different
patterns that have come from various,
research papers, et cetera, along the way.
so they're very interested in things
like chain of thought data generation,
different forms of instruction generation,
and then also how do you empower these
agents to actually complete tasks.
So things related to role playing,
things related to coordination
and collaboration of agents.
And this is where the Eigent
AI ideas originally came from.
So looking at this of what now is the
open source cowork desktop, The whole idea
here is that this is built in three tiers.
The first tier is the front end, right?
This is an electron desktop app.
and this, is obviously what takes
care of the UI and stuff like that.
The second element is your agent backend.
so this is a quite simple fast API backend
in there, and that's got a bunch of things
in it that will basically orchestrate the
execution, maintain state for agents, do
a bunch of different things like that.
And then the third tier is the
actual workforce, which are the
actual agents that are built on
the Camel AI multi-agent core.
So the other thing that I find interesting
about this product is that while it's
built to work with models from Frontier
Labs, and they've actually done a bunch
of interesting things where they've done
collaborations with the Gemini team for
the Gemini three models, they've also
had collaborations with a number of the
open weights companies that are working
on models like Minimax, like ZAI, and
I think they've even been working on
some things with the moonshot team who
made Kimi K2 But talking to Guohao about
this, his long-term goal is that this
should all be able to be done with local
agents and the way that he's architected
all of this at the start, is that yes,
while at the moment, you're using perhaps
proprietary models from some of the big
companies out there, or you're using
some of the really big open models.
Eventually, this is going to be
something that's gonna run locally
on your computer using a local model.
And I must say with Qwen4 and
Gemma 4 and a number of other big
open model projects that are just
around the corner from coming out.
This is an idea that I also subscribe
to a lot, and the reason why I
was interested in doing the video.
So the team actually put out a
blog post late last year, looking
at enterprise agents with, Gemini
3 Pro and actually doing all this.
And this is the reason why I
said that they're not trying
to actually sell you anything.
Their goal is actually hiring really good
agent builders 'cause they're starting
to roll out industry specific versions
of these kind of multi-agent systems
for corporate and enterprise customers.
So in this blog post they actually
talk about, the whole sort of breakdown
of how they've got the React Electron
app, So this is a very nice, simple
way to make a front end app that can
work on Mac, can work on Windows,
if you haven't seen that before.
and then they've got their backend
using Fast API using some standard
stuff there what is interesting is how
the multi-agent system actually works.
So if we dive into their
architecture we can see a number
of clear patterns going on here.
so the first one is task
decomposition, right?
This has become a standard pattern in
sort of the top agents for a while now,
so whether you're looking at something
like Manus, whether you're looking at open
systems that replicate these things, they
tend to have a decomposition of a task and
breaking it down, and then sort of hooking
it up to some kind of coordinator agent.
and a lot of these ideas go back to
papers like Magentic one from Microsoft
and even before that, people were looking
at this idea of a coordination agent
running a bunch of other small agents.
and we can see here that it's gonna
have a bunch of subtasks, which
will then put on a dependency graph.
and then as each of these is ready
and gets processed, they have their
task channel, which I guess you can
think of as being all of this, putting
it together like a queue system
that sort of runs these and actually
assigns, each of these subtasks to a
capable worker or to a capable agent.
Now the system will then fire off a
lot of these agents often in parallel
so that you're not sitting there
sequentially for one thing, to finish.
And this is one of the key features of
the graph system that they're using.
They're actually using a directive acyclic
graph or a DAG to set up these various
tasks, but then to be able to run nodes
in parallel and then the results of those
sort of mini agents or nodes get stored
as dependencies then for other tasks
that are gonna be run going forward.
Now they have four prebuilt
specialized agents.
They have a developer agent, which
has capabilities around code execution
and technical sort of implementation.
They have a Browser agent, which
is all for information retrieval
from perhaps a RAG system, web
search, those kinds of things.
They have a document processing
agent, so this is for writing
and editing, different things.
And then the fourth one
is a multimodal agent,
which is set up obviously to
handle things like images, audio.
And modalities that are perhaps not
gonna fit well into the other agents.
This whole system, obviously is also
then set up to actually work with lots
of tools like MCPs and with a browser
automation architecture in there.
So this is something that
they've built themselves that
leverages on Playwright APIs.
And you can see because they've
customized it to their specific
needs, it's actually kind of a set
of tools rather than just a browser.
they've got a whole bunch of tools around
navigation, around information retrieval
around interacting with the browser and
around how to actually get the best out of
this to complete lots of tasks, et cetera.
so if we look at this in action, we
can actually see that, okay, this
is running the different parts.
as it goes through, it can actually
monitor what it's doing, how it's
doing the decomposition, how it's
actually breaking things down,
and then how it actually uses that
browser automation to be able to do
a variety of different tasks here.
you can see here it's running with
Gemini 3 to do a variety of different
sort of enterprise tasks, in this
case using the Salesforce platform.
So one of the cool things about
this is that because you've got the
developer agent there, it can do a
lot more than just do coding tasks.
it can actually access your file system
and then be able to edit stuff  So a good
example of how it all comes together here,
is actually using the developer agent.
So this is a simple prompt that's
just helped me organize my desktop.
And because the developer agent
has access to the file system, it
can actually go to your desktop.
it can see, through LS commands, et
cetera, what's actually on the desktop.
make folders and then categorize, the
different files into, each of the folders.
And you can see even there, it processed
an image, to work out okay, what
folder that should actually go in.
so this is one of the cool things about
this once you've got these four agents,
And remember, the four agents
are your developer agent, your
browser agent, your documents
agent, and your multimodal agent.
so if you are serious about building
actual sort of, multi-agent systems,
definitely come over and check this out.
like I said earlier on, this
is fully Apache 2 license.
You can use any of it if you want to just
go in there and look at their prompts.
If you want to come in and actually
see how they set up the Electron app
to actually work with the backend, et
cetera, all of this is now open source
and you can see that already people are
forking it like crazy to actually look
at building their own systems or their
own products around this kind of thing.
If you're looking here, they're
still doing active development on it.
they're still actually contributing
to the repo, and I think they're also
open to other people contributing
to this repo with the goal of people
using the Eigent AI product to
actually go on and build whole sort
of customized systems around this.
so if you're looking where to get started
with actually learning how it all works
together and stuff like that, a great
resource is their documentation here.
you can see this basically outlines
all the different parts, the different,
capabilities and stuff like that.
And then you can actually go into
the source code to find out the
bits that you're interested in and
how it's actually all put together.
So, like I mentioned at the start,
there's nothing really here for you
to buy per se, unless you're perhaps
a really big organization that is
looking at using one of their enterprise
systems of something like this.
a lot of the goal that both Guohao
and the team here is to sort of pay
it forward and to try and advance, the
use of agents much more going forward.
So if you come into the GitHub repo,
be sure to leave a star, for the repo.
And as always, I'll leave some links
in the description, to some articles
that I talked about in here And a
link to Guohao's Twitter so that
you can follow him, where he's been
talking about this and a lot of
agent research for quite a while now.
anyway, so let me know in the comments
what you think about this, what you think
about the whole idea of a lot of startups
having to pivot based on these model
companies releasing these very
sort of broad applications.
In this case, it's certainly been a
win I think both for the open source
community, but also with the attention
that Camel AI is getting, I think
it's actually a win for them as well.
So let me know in the comments.
I'd love to hear what
you think about this.
As always, if you found the video useful,
please click like and subscribe, and
I will talk to you in the next video.
Bye for now.
