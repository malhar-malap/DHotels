package com.healthcare.portal.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods that should be intercepted for Audit Logging.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogActivity {
    
    /**
     * The action name to log (e.g., "UNLOCK_CONTACT", "APPROVE_LISTING").
     */
    String action();
    
    /**
     * The entity type being acted upon (e.g., "Listing", "User").
     */
    String entityType() default "";
}
