package uk.sodafom.app;

import android.os.Bundle;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Locale;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "ArchieSpeech")
public class ArchieSpeechPlugin extends Plugin implements TextToSpeech.OnInitListener {
    private TextToSpeech tts;
    private final AtomicBoolean ready = new AtomicBoolean(false);
    private PluginCall pendingCall;
    private String pendingText;
    private static final String UTTERANCE_ID = "archie-response";

    @Override
    public void load() {
        super.load();
        getActivity().runOnUiThread(() -> {
            android.util.Log.i("ArchieSpeech", "Creating TextToSpeech...");
            tts = new TextToSpeech(getContext(), this);
        });
    }

    @Override
    public void onInit(int status) {
        android.util.Log.i("ArchieSpeech", "onInit status: " + status);
        if (status != TextToSpeech.SUCCESS || tts == null) {
            ready.set(false);
            android.util.Log.e("ArchieSpeech", "TTS Init Failed");
            if (pendingCall != null) {
                pendingCall.reject("Android Text-to-Speech failed to initialise");
                pendingCall = null;
            }
            return;
        }

        String engine = tts.getDefaultEngine();
        android.util.Log.i("ArchieSpeech", "TTS Engine: " + engine);

        int languageResult = tts.setLanguage(Locale.UK);
        android.util.Log.i("ArchieSpeech", "setLanguage(UK) result: " + languageResult);
        if (languageResult == TextToSpeech.LANG_MISSING_DATA || languageResult == TextToSpeech.LANG_NOT_SUPPORTED) {
            android.util.Log.w("ArchieSpeech", "UK English not supported, falling back to US");
            tts.setLanguage(Locale.US);
        }
        // Prefer a youthful, warm UK English voice when the installed engine exposes one.
        // Android voice names vary by manufacturer, so this is best-effort and safely falls back.
        try {
            Set<Voice> voices = tts.getVoices();
            Voice best = null;
            if (voices != null) {
                android.util.Log.i("ArchieSpeech", "Found " + voices.size() + " voices");
                for (Voice voice : voices) {
                    if (voice == null || voice.getLocale() == null) continue;
                    String lang = voice.getLocale().toLanguageTag().toLowerCase(Locale.ROOT);
                    String name = voice.getName() == null ? "" : voice.getName().toLowerCase(Locale.ROOT);

                    // Only use an installed local voice. Selecting a network-only
                    // voice on some HONOR devices reports success but produces silence.
                    boolean isLocal = !voice.isNetworkConnectionRequired();

                    if (!lang.startsWith("en") || !isLocal) continue;

                    if (best == null) best = voice;

                    // Favor local UK English
                    if (lang.startsWith("en-gb")) {
                        if (name.contains("male") || name.contains("young") || name.contains("boy")) {
                            best = voice;
                            break;
                        }
                        if (!best.getLocale().toLanguageTag().toLowerCase().startsWith("en-gb")) {
                            best = voice;
                        }
                    }
                }
            }
            if (best != null) {
                android.util.Log.i("ArchieSpeech", "Selected voice: " + best.getName() + " (" + best.getLocale() + ") Local: " + !best.isNetworkConnectionRequired());
                tts.setVoice(best);
            } else {
                android.util.Log.i("ArchieSpeech", "No installed local English voice found; retaining the engine default");
            }
        } catch (Exception e) {
            android.util.Log.e("ArchieSpeech", "Error selecting voice", e);
        }

        // Gentle, clear, slightly youthful settings suitable for a learning buddy.
        tts.setSpeechRate(0.94f);
        // Slightly higher pitch gives Archie a younger sound while remaining clear.
        tts.setPitch(1.24f);
        tts.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build());

        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String utteranceId) {
                android.util.Log.i("ArchieSpeech", "onStart: " + utteranceId);
            }

            @Override public void onDone(String utteranceId) {
                android.util.Log.i("ArchieSpeech", "onDone: " + utteranceId);
                resolvePending("finished");
            }

            @Override public void onError(String utteranceId) {
                android.util.Log.e("ArchieSpeech", "onError: " + utteranceId);
                rejectPending("Android Text-to-Speech playback failed");
            }

            @Override public void onError(String utteranceId, int errorCode) {
                android.util.Log.e("ArchieSpeech", "onError: " + utteranceId + " code: " + errorCode);
                rejectPending("Android Text-to-Speech playback failed: " + errorCode);
            }
        });

        ready.set(true);
        if (pendingText != null && pendingCall != null) {
            final String text = pendingText;
            pendingText = null;
            doSpeak(text);
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "").trim();
        android.util.Log.i("ArchieSpeech", "speak called with text: " + text);
        if (text.isEmpty()) {
            call.resolve();
            return;
        }

        getActivity().runOnUiThread(() -> {
            if (pendingCall != null && pendingCall != call) {
                pendingCall.reject("Speech replaced by a newer response");
            }
            pendingCall = call;

            if (!ready.get() || tts == null) {
                android.util.Log.i("ArchieSpeech", "TTS not ready, deferring speak");
                pendingText = text;
                if (tts == null) tts = new TextToSpeech(getContext(), this);
                return;
            }
            doSpeak(text);
        });
    }

    private void doSpeak(String text) {
        android.util.Log.i("ArchieSpeech", "doSpeak: " + text);
        if (tts == null) {
            android.util.Log.e("ArchieSpeech", "doSpeak failed: tts is null");
            rejectPending("Android Text-to-Speech is unavailable");
            return;
        }

        // Ensure volume is up for the test
        try {
            android.media.AudioManager audioManager = (android.media.AudioManager) getContext().getSystemService(android.content.Context.AUDIO_SERVICE);
            if (audioManager != null) {
                int maxVolume = audioManager.getStreamMaxVolume(android.media.AudioManager.STREAM_MUSIC);
                int currentVolume = audioManager.getStreamVolume(android.media.AudioManager.STREAM_MUSIC);
                android.util.Log.i("ArchieSpeech", "Current volume: " + currentVolume + "/" + maxVolume);
                if (currentVolume < maxVolume / 2) {
                    audioManager.setStreamVolume(android.media.AudioManager.STREAM_MUSIC, maxVolume / 2, 0);
                    android.util.Log.i("ArchieSpeech", "Boosted volume to: " + (maxVolume / 2));
                }
            }
        } catch (Exception e) {
            android.util.Log.w("ArchieSpeech", "Could not check/set volume", e);
        }

        tts.stop();

        Bundle params = new Bundle();
        params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, UTTERANCE_ID);

        // Ensure we are using the music stream for audible output
        params.putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, android.media.AudioManager.STREAM_MUSIC);

        int result = tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, UTTERANCE_ID);
        android.util.Log.i("ArchieSpeech", "tts.speak result: " + result);
        if (result == TextToSpeech.ERROR) {
            rejectPending("Android Text-to-Speech could not start");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (tts != null) tts.stop();
            resolvePending("stopped");
            call.resolve();
        });
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", ready.get());
        call.resolve(result);
    }

    private synchronized void resolvePending(String status) {
        if (pendingCall != null) {
            JSObject result = new JSObject();
            result.put("status", status);
            pendingCall.resolve(result);
            pendingCall = null;
        }
    }

    private synchronized void rejectPending(String message) {
        if (pendingCall != null) {
            pendingCall.reject(message);
            pendingCall = null;
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        ready.set(false);
        super.handleOnDestroy();
    }
}
