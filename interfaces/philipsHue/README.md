---
layout: doc
title: Philips Hue Interface
permalink: /docs/vuforia-spatial-basic-interfaces-addon/interfaces/philipsHue
---

## Philips Hue Interface

To connect to your local Philips Hue lights, first follow the server setup
instructions in the [Vuforia Spatial Edge Server Getting Started
guide](https://spatialtoolbox.vuforia.com/docs/use/connect-to-the-physical-world/startSystem).
Next, clone or download the vuforia-spatial-basic-interfaces-addon into your
server's `addons` directory. Restart the server so it can learn about the new
add-on.

Once restarted, navigate to http://localhost:8080 to configure your new Philips
Hue interface. Click "Manage Hardware Interfaces" then click the switch next to
"philipsHue" to enable it. Now click the gear to watch the configuration of the
interface. Press the pairing button on your Hue Hub to allow the interface to
automatically configure. If successful, the configuration page will update with
a list of your local lights. Your server's console may contain log messages
explaining any problems encountered during the pairing process.

At this point you're good to go. The interface has created blank objects for
each Philips Hue light that you can now give Vuforia markers to view and
control them using the Spatial Toolbox. For more information on this part of
the process, check out the [object creation
guide](https://spatialtoolbox.vuforia.com/docs/use/connect-to-the-physical-world/create-object)
