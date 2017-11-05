#!/bin/bash
gulp
scp -r dist/* oster@thoster.net:/var/www/thoster.net/web/adventex/