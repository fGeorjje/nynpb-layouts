# nynpb-layouts

A [NodeCG](http://github.com/nodecg/nodecg) layouts bundle used for the "[*New Year, New PB*](https://horaro.org/new-year-new-pb)" event broadcasted during January 06/07, 2024 on [No Glitches Allowed](https://twitch.tv/noglitchesallowed]. Depends on [nodecg-speedcontrol](https://github.com/speedcontrol/nodecg-speedcontrol).

## Before using

As with most published speedrun marathon bundles, this is not intended to be used verbatim.

- Firstly, this bundle is coded with the assumption of a Behringer X32 being used for audio mixing. I know for sure of exactly two other marathons that wholly own this console. If you're an event organizer and own one, send me a picture and I will update this count :D
- Secondly, many data sources, connections (e.g. the local Behringer X32 IP address) and even local passwords (e.g. to obs-websocket) in this bundle are hardcoded, so using this bundle as-is could even be considered a security risk.
- Thirdly, this contains a lot of NoGA specific branding that you probably just don't want to broadcast as-is on your own channel, and one of the audio files is also sampled and licensed specifically for this event.

Build something new from this!

## Additional Information

Some additional files used for the event, but not used by NodeCG are located in the assets folder. This includes the X32 mixing scene, the OBS scene collection, and the Ardour project.

[SAR](https://github.com/eiz/SynchronousAudioRouter) was used to send/receive VLC audio. Create 21 2-channel playback lines, and label them "Stereo 01" to "Stereo 12", then "Mono 01" - "Mono 09". Finally, create a 1-channel recording line called "VC OUT".

You will need [werman's RNNoise VST filter](https://github.com/werman/noise-suppression-for-voice) installed and loaded for Ardour if you wish to enable noise suppression for microphone tracks.

Your Behringer X32 **must** be connected to the host PC via the expansion card USB interface.

This bundle integrates with foobar2000 if the [beefweb](https://github.com/hyperblast/beefweb) interface plugin is installed. It *might* also work with DeaDBeeF.

This isn't nowhere near all the information you'd need to setup this bundle. [Contact me](mailto:fgeorjje@gmail.com) if you are setting up a derivative of this bundle and need help.

## License

All files EXCEPT `/graphics/whoosh4.mp3` are provided under the MIT license, which is available to read in the [LICENSE](LICENSE) file.

`/graphics/whoosh4.mp3` is sampled from another project with permission and all rights reserved.