package com.hclc.ownerpulse;

import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Inflate our custom splash layout
        View splashView = getLayoutInflater().inflate(R.layout.splash_screen, null);
        addContentView(splashView, new android.view.ViewGroup.LayoutParams(
                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                android.view.ViewGroup.LayoutParams.MATCH_PARENT
        ));

        View logoCard = splashView.findViewById(R.id.logo_card);
        TextView title = splashView.findViewById(R.id.splash_title);
        TextView subtitle = splashView.findViewById(R.id.splash_subtitle);

        // Sequence the animations for a premium feel
        // 1. Round logo card fades in and scales slightly
        logoCard.animate()
                .alpha(1f)
                .scaleX(1.05f).scaleY(1.05f)
                .setDuration(1000)
                .withEndAction(() -> {
                    logoCard.animate().scaleX(1f).scaleY(1f).setDuration(1000).start();
                })
                .start();

        // 2. Title fades in and slides up slightly
        title.setTranslationY(20f);
        title.animate()
                .alpha(1f)
                .translationY(0f)
                .setStartDelay(500)
                .setDuration(1000)
                .start();

        // 3. Subtitle fades in
        subtitle.animate()
                .alpha(1f)
                .setStartDelay(1000)
                .setDuration(1000)
                .start();

        // Hide splash screen after the sequence completes
        // We match the duration to Capacitor's splash duration if needed
        splashView.postDelayed(() -> {
            splashView.animate()
                    .alpha(0f)
                    .setDuration(600)
                    .withEndAction(() -> {
                        splashView.setVisibility(View.GONE);
                    })
                    .start();
        }, 3500);
    }
}
